import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Type for sync result
 */
type SyncResult = {
    date: Date;
    totalRecords: number;
    synced: number;
    failed: number;
    skipped: number;
    payrollSynced: number;
    leaveSynced: number;
    errors: any[];
};

/**
 * AttendanceSyncService
 *
 * Handles daily synchronization of attendance records with:
 * - Payroll system
 * - Leave management system
 *
 * Ensures data consistency across systems through:
 * - Scheduled daily sync
 * - Manual sync triggers
 * - Conflict resolution
 * - Sync status tracking
 */
@Injectable()
export class AttendanceSyncService {
    private readonly logger = new Logger(AttendanceSyncService.name);

    constructor(
        @InjectModel('AttendanceRecord') private attendanceModel: Model<any>,
        @InjectConnection() private connection: Connection,
    ) {}

    /**
     * Daily sync scheduler - runs at 2 AM every day
     * Syncs previous day's attendance to payroll and leave systems
     */
    @Cron('0 2 * * *', {
        name: 'daily-attendance-sync',
        timeZone: 'UTC',
    })
    async scheduledDailySync() {
        this.logger.log('Starting scheduled daily attendance sync...');

        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const result = await this.syncAttendanceForDate(yesterday);

            this.logger.log(`Scheduled sync completed: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error('Scheduled sync failed:', error);
        }
    }

    /**
     * Sync attendance records for a specific date
     */
    async syncAttendanceForDate(date: Date): Promise<SyncResult> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        this.logger.log(`Syncing attendance for date: ${startOfDay.toISOString()}`);

        // Get all attendance records for the date
        const records = await this.attendanceModel.find({
            'punches.time': { $gte: startOfDay, $lte: endOfDay },
        }).lean();

        this.logger.log(`Found ${records.length} attendance records to sync`);

        let synced = 0;
        let failed = 0;
        let skipped = 0;
        let payrollSynced = 0;
        let leaveSynced = 0;
        const errors: any[] = [];

        for (const record of records) {
            try {
                // Check if already synced
                if (record.syncStatus?.lastSyncDate &&
                    new Date(record.syncStatus.lastSyncDate) >= startOfDay) {
                    skipped++;
                    continue;
                }

                // Sync to payroll
                const payrollResult = await this.syncToPayroll(record, date);
                if (payrollResult.success) payrollSynced++;

                // Sync to leave system
                const leaveResult = await this.syncToLeaveSystem(record, date);
                if (leaveResult.success) leaveSynced++;

                // Update sync status
                await this.updateSyncStatus(record._id, {
                    lastSyncDate: new Date(),
                    payrollSynced: payrollResult.success,
                    leaveSynced: leaveResult.success,
                    syncErrors: [...(payrollResult.errors || []), ...(leaveResult.errors || [])],
                });

                synced++;
            } catch (error) {
                this.logger.error(`Failed to sync record ${record._id}:`, error);
                failed++;
                errors.push({
                    recordId: record._id,
                    error: error.message,
                });
            }
        }

        return {
            date: startOfDay,
            totalRecords: records.length,
            synced,
            failed,
            skipped,
            payrollSynced,
            leaveSynced,
            errors,
        };
    }

    /**
     * Sync attendance record to payroll system
     */
    private async syncToPayroll(record: any, date: Date): Promise<{
        success: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        try {
            // Check if payroll collection exists
            const payrollCollection = this.connection.db!.collection('payrollattendancedata');

            // Calculate work hours and overtime
            const workMinutes = record.totalWorkMinutes || 0;
            const workHours = workMinutes / 60;

            // Get shift assignment to determine standard hours
            const shiftAssignment = await this.connection.db!.collection('shiftassignments')
                .findOne({
                    employeeId: record.employeeId,
                    startDate: { $lte: date },
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: { $gte: date } }
                    ]
                });

            let standardHours = 8; // Default
            let overtimeHours = 0;

            if (shiftAssignment) {
                const shift = await this.connection.db!.collection('shifts')
                    .findOne({ _id: shiftAssignment.shiftId });

                if (shift) {
                    // Calculate standard hours from shift
                    const startParts = shift.startTime.split(':');
                    const endParts = shift.endTime.split(':');
                    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                    standardHours = (endMinutes - startMinutes) / 60;
                }
            }

            // Calculate overtime
            if (workHours > standardHours) {
                overtimeHours = workHours - standardHours;
            }

            // Prepare payroll data
            const payrollData = {
                employeeId: record.employeeId,
                attendanceRecordId: record._id,
                date: date,
                workHours: workHours,
                standardHours: standardHours,
                overtimeHours: overtimeHours,
                totalWorkMinutes: record.totalWorkMinutes,
                punches: record.punches,
                latenessMinutes: record.latenessMinutes || 0,
                isPresent: workHours > 0,
                isHalfDay: workHours > 0 && workHours < (standardHours * 0.6),
                isFullDay: workHours >= (standardHours * 0.6),
                syncedAt: new Date(),
                syncSource: 'attendance-sync-service',
            };

            // Upsert to payroll collection
            await payrollCollection.updateOne(
                {
                    employeeId: record.employeeId,
                    date: date,
                },
                {
                    $set: payrollData,
                },
                { upsert: true }
            );

            this.logger.debug(`Synced to payroll: Employee ${record.employeeId}, Date ${date.toISOString()}`);

            return { success: true, errors: [] };
        } catch (error) {
            this.logger.error('Error syncing to payroll:', error);
            errors.push(`Payroll sync error: ${error.message}`);
            return { success: false, errors };
        }
    }

    /**
     * Sync attendance record to leave system
     */
    private async syncToLeaveSystem(record: any, date: Date): Promise<{
        success: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        try {
            // Check for leave records on this date
            const leaveCollection = this.connection.db!.collection('leaverequests');

            const leaveRecord = await leaveCollection.findOne({
                employeeId: record.employeeId,
                startDate: { $lte: date },
                endDate: { $gte: date },
                status: 'APPROVED',
            });

            if (leaveRecord) {
                // Employee has approved leave on this date
                const workMinutes = record.totalWorkMinutes || 0;

                if (workMinutes > 0) {
                    // Employee worked on a leave day - mark as conflict
                    this.logger.warn(`Conflict detected: Employee ${record.employeeId} has approved leave but also attendance on ${date.toISOString()}`);

                    // Create conflict record
                    const conflictCollection = this.connection.db!.collection('attendanceleavesyncconflicts');
                    await conflictCollection.insertOne({
                        employeeId: record.employeeId,
                        date: date,
                        attendanceRecordId: record._id,
                        leaveRequestId: leaveRecord._id,
                        conflictType: 'LEAVE_WITH_ATTENDANCE',
                        workMinutes: workMinutes,
                        leaveType: leaveRecord.leaveType,
                        detectedAt: new Date(),
                        resolved: false,
                        resolvedAt: null,
                        resolution: null,
                    });

                    errors.push(`Leave conflict: Employee has approved leave but recorded attendance`);
                }

                // Update leave balance if this was a partial attendance
                if (workMinutes > 0 && workMinutes < 240) { // Less than 4 hours
                    // Consider converting to half-day leave
                    await leaveCollection.updateOne(
                        { _id: leaveRecord._id },
                        {
                            $set: {
                                'syncData.hasAttendance': true,
                                'syncData.attendanceMinutes': workMinutes,
                                'syncData.suggestedLeaveType': 'HALF_DAY',
                                'syncData.lastSyncDate': new Date(),
                            }
                        }
                    );
                }
            } else {
                // No leave on this date
                const workMinutes = record.totalWorkMinutes || 0;

                if (workMinutes === 0 && record.punches && record.punches.length === 0) {
                    // No attendance and no leave - potential absent
                    const absenceCollection = this.connection.db!.collection('absencerecords');

                    // Check if it's a weekend or holiday
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const holiday = await this.connection.db!.collection('holidays').findOne({
                        date: date,
                        active: true,
                    });

                    if (!isWeekend && !holiday) {
                        // Mark as potential absence
                        await absenceCollection.updateOne(
                            {
                                employeeId: record.employeeId,
                                date: date,
                            },
                            {
                                $set: {
                                    employeeId: record.employeeId,
                                    date: date,
                                    type: 'ABSENT',
                                    hasLeave: false,
                                    hasAttendance: false,
                                    detectedAt: new Date(),
                                    verified: false,
                                }
                            },
                            { upsert: true }
                        );
                    }
                }
            }

            this.logger.debug(`Synced to leave system: Employee ${record.employeeId}, Date ${date.toISOString()}`);

            return { success: true, errors };
        } catch (error) {
            this.logger.error('Error syncing to leave system:', error);
            errors.push(`Leave sync error: ${error.message}`);
            return { success: false, errors };
        }
    }

    /**
     * Update sync status in attendance record
     */
    private async updateSyncStatus(recordId: any, syncData: any): Promise<void> {
        await this.attendanceModel.updateOne(
            { _id: recordId },
            {
                $set: {
                    syncStatus: syncData,
                }
            }
        );
    }

    /**
     * Manual sync trigger for specific date range
     */
    async syncDateRange(startDate: Date, endDate: Date): Promise<any> {
        this.logger.log(`Manual sync requested: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        const results: SyncResult[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const result = await this.syncAttendanceForDate(new Date(currentDate));
            results.push(result);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            startDate,
            endDate,
            totalDays: results.length,
            totalRecords: results.reduce((sum, r) => sum + r.totalRecords, 0),
            totalSynced: results.reduce((sum, r) => sum + r.synced, 0),
            totalFailed: results.reduce((sum, r) => sum + r.failed, 0),
            dailyResults: results,
        };
    }

    /**
     * Get sync conflicts that need resolution
     */
    async getSyncConflicts(filters?: {
        employeeId?: string;
        startDate?: Date;
        endDate?: Date;
        resolved?: boolean;
    }): Promise<any[]> {
        const conflictCollection = this.connection.db!.collection('attendanceleavesyncconflicts');

        const query: any = {};
        if (filters?.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
        if (filters?.startDate || filters?.endDate) {
            query.date = {};
            if (filters.startDate) query.date.$gte = filters.startDate;
            if (filters.endDate) query.date.$lte = filters.endDate;
        }
        if (filters?.resolved !== undefined) query.resolved = filters.resolved;

        const conflicts = await conflictCollection.find(query).sort({ date: -1 }).toArray();

        return conflicts;
    }

    /**
     * Resolve a sync conflict
     */
    async resolveConflict(conflictId: string, resolution: {
        action: 'KEEP_ATTENDANCE' | 'KEEP_LEAVE' | 'CONVERT_TO_HALF_DAY' | 'MANUAL_REVIEW';
        note?: string;
        resolvedBy: string;
    }): Promise<void> {
        const conflictCollection = this.connection.db!.collection('attendanceleavesyncconflicts');

        const conflict = await conflictCollection.findOne({ _id: new Types.ObjectId(conflictId) });
        if (!conflict) {
            throw new Error('Conflict not found');
        }

        // Apply resolution based on action
        switch (resolution.action) {
            case 'KEEP_ATTENDANCE':
                // Cancel the leave
                await this.connection.db!.collection('leaverequests').updateOne(
                    { _id: conflict.leaveRequestId },
                    {
                        $set: {
                            status: 'CANCELLED',
                            cancellationReason: 'Employee was present - attendance takes precedence',
                            cancelledBy: resolution.resolvedBy,
                            cancelledAt: new Date(),
                        }
                    }
                );
                break;

            case 'KEEP_LEAVE':
                // Mark attendance as invalid
                await this.attendanceModel.updateOne(
                    { _id: conflict.attendanceRecordId },
                    {
                        $set: {
                            invalidated: true,
                            invalidationReason: 'Employee on approved leave',
                            invalidatedBy: resolution.resolvedBy,
                            invalidatedAt: new Date(),
                        }
                    }
                );
                break;

            case 'CONVERT_TO_HALF_DAY':
                // Convert leave to half-day
                await this.connection.db!.collection('leaverequests').updateOne(
                    { _id: conflict.leaveRequestId },
                    {
                        $set: {
                            leaveType: 'HALF_DAY',
                            modifiedBy: resolution.resolvedBy,
                            modifiedAt: new Date(),
                            modificationReason: 'Converted to half-day due to partial attendance',
                        }
                    }
                );
                break;
        }

        // Mark conflict as resolved
        await conflictCollection.updateOne(
            { _id: new Types.ObjectId(conflictId) },
            {
                $set: {
                    resolved: true,
                    resolvedAt: new Date(),
                    resolution: resolution,
                }
            }
        );

        this.logger.log(`Conflict ${conflictId} resolved with action: ${resolution.action}`);
    }

    /**
     * Get sync statistics
     */
    async getSyncStatistics(startDate?: Date, endDate?: Date): Promise<any> {
        const query: any = {};
        if (startDate || endDate) {
            query['syncStatus.lastSyncDate'] = {};
            if (startDate) query['syncStatus.lastSyncDate'].$gte = startDate;
            if (endDate) query['syncStatus.lastSyncDate'].$lte = endDate;
        }

        const totalRecords = await this.attendanceModel.countDocuments(query);
        const syncedToPayroll = await this.attendanceModel.countDocuments({
            ...query,
            'syncStatus.payrollSynced': true,
        });
        const syncedToLeave = await this.attendanceModel.countDocuments({
            ...query,
            'syncStatus.leaveSynced': true,
        });

        const conflictCollection = this.connection.db!.collection('attendanceleavesyncconflicts');
        const totalConflicts = await conflictCollection.countDocuments({
            detectedAt: startDate ? { $gte: startDate } : undefined,
        });
        const unresolvedConflicts = await conflictCollection.countDocuments({
            resolved: false,
            detectedAt: startDate ? { $gte: startDate } : undefined,
        });

        return {
            period: {
                startDate: startDate || 'All time',
                endDate: endDate || 'Present',
            },
            totalRecords,
            syncedToPayroll,
            syncedToLeave,
            payrollSyncRate: totalRecords > 0 ? (syncedToPayroll / totalRecords * 100).toFixed(2) + '%' : '0%',
            leaveSyncRate: totalRecords > 0 ? (syncedToLeave / totalRecords * 100).toFixed(2) + '%' : '0%',
            totalConflicts,
            unresolvedConflicts,
        };
    }
}

