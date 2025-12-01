// src/time-management/shift-management/shift-expiry.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
<<<<<<< HEAD
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
=======
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
import { ShiftAssignment, ShiftAssignmentDocument } from '../models/shift-assignment.schema';
import { NotificationLog, NotificationLogDocument } from '../models/notification-log.schema';

/**
 * ShiftExpiryScheduler
 * - runs daily and creates NotificationLog entries for assignments that will expire within the configured window
<<<<<<< HEAD
=======
 * - automatically finds HR/Admin users to notify (no HR_USER_ID required)
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
 */
@Injectable()
export class ShiftExpiryScheduler {
    private readonly logger = new Logger(ShiftExpiryScheduler.name);

    constructor(
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLogDocument>,
<<<<<<< HEAD
=======
        @InjectConnection() private readonly connection: Connection,
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
    ) {}

    /**
     * Runs daily at configured hour.
     * CRON: default '0 8 * * *' (08:00 server time).
<<<<<<< HEAD
     * Use env SHIFT_EXPIRY_NOTIFICATION_HOUR to override (HH:mm).
=======
     * Automatically finds HR/Admin users to notify - no configuration required!
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
     */
    @Cron('0 8 * * *')
    async runDaily() {
        try {
            const daysEnv = Number(process.env.SHIFT_EXPIRY_NOTIFICATION_DAYS ?? 7);
            const days = Number.isFinite(daysEnv) && daysEnv > 0 ? daysEnv : 7;

            // compute the threshold window: now -> now + days
            const now = new Date();
            const threshold = new Date();
            threshold.setDate(now.getDate() + days);
            threshold.setHours(23, 59, 59, 999);

            // find assignments with an endDate within next `days` days and with a relevant status
            const assignments = await this.shiftAssignmentModel.find({
                endDate: { $exists: true, $lte: threshold, $gte: now },
                status: { $in: ['PENDING', 'APPROVED'] },
            }).lean();

            if (!assignments?.length) {
                this.logger.debug(`No expiring assignments in next ${days} days`);
                return;
            }

<<<<<<< HEAD
            // resolve recipients: HR_USER_ID or SYSTEM_USER_ID (fallback)
            const hrUserId = process.env.HR_USER_ID ?? process.env.SYSTEM_USER_ID ?? null;
            const recipient = hrUserId ? new Types.ObjectId(hrUserId) : null;

            for (const a of assignments) {
                try {
                    // prevent duplicate notification for the same assignment on the same day
                    const already = await this.notificationModel.findOne({
                        to: recipient,
                        type: 'SHIFT_EXPIRY',
                        // store assignment reference in message (or we can add metadata field)
                        message: { $regex: a._id.toString() },
                        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }, // only today
                    }).lean();

                    if (already) continue;

                    const msg = `Shift assignment ${a._id} for employee ${a.employeeId} expires on ${a.endDate?.toISOString().slice(0,10)}. Please review.`;

                    // notify HR
                    if (recipient) {
                        await this.notificationModel.create({
                            to: recipient,
                            type: 'SHIFT_EXPIRY',
                            message: msg,
                        } as Partial<NotificationLog>);
                    } else {
                        // no HR recipient configured — fallback to logging
                        this.logger.warn('No HR recipient configured for shift expiry notifications; consider setting HR_USER_ID env var');
                    }

                    // optionally notify the employee as well
                    if (a.employeeId) {
                        try {
                            await this.notificationModel.create({
                                to: a.employeeId,
                                type: 'SHIFT_EXPIRY_EMPLOYEE',
                                message: `Your shift assignment expires on ${a.endDate?.toISOString().slice(0,10)}. Please contact HR if needed.`,
                            } as Partial<NotificationLog>);
=======
            // Automatically find all HR/Admin users
            const hrUsers = await this.findHRUsers();

            if (!hrUsers || hrUsers.length === 0) {
                this.logger.warn('No HR/Admin users found in the system. Notifications will only be sent to employees.');
            }

            let notificationCount = 0;

            for (const a of assignments) {
                try {
                    const expiryDate = a.endDate?.toISOString().slice(0,10);

                    // Notify all HR/Admin users
                    for (const hrUser of hrUsers) {
                        // prevent duplicate notification for the same assignment on the same day
                        const alreadyNotified = await this.notificationModel.findOne({
                            to: hrUser.employeeProfileId,
                            type: 'SHIFT_EXPIRY',
                            message: { $regex: a._id.toString() },
                            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
                        }).lean();

                        if (!alreadyNotified) {
                            const msg = `Shift assignment ${a._id} for employee ${a.employeeId} expires on ${expiryDate}. Please review for renewal or reassignment.`;

                            await this.notificationModel.create({
                                to: hrUser.employeeProfileId,
                                type: 'SHIFT_EXPIRY',
                                message: msg,
                            } as any);

                            notificationCount++;
                            this.logger.debug(`Notified HR user ${hrUser.workEmail} about expiring assignment ${a._id}`);
                        }
                    }

                    // Notify the employee
                    if (a.employeeId) {
                        try {
                            const alreadyNotified = await this.notificationModel.findOne({
                                to: a.employeeId,
                                type: 'SHIFT_EXPIRY_EMPLOYEE',
                                message: { $regex: a._id.toString() },
                                createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
                            }).lean();

                            if (!alreadyNotified) {
                                await this.notificationModel.create({
                                    to: a.employeeId,
                                    type: 'SHIFT_EXPIRY_EMPLOYEE',
                                    message: `Your shift assignment expires on ${expiryDate}. Please contact HR if renewal is needed.`,
                                } as any);

                                notificationCount++;
                                this.logger.debug(`Notified employee ${a.employeeId} about their expiring assignment`);
                            }
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
                        } catch (e) {
                            this.logger.warn('Failed to create notification for employee', e);
                        }
                    }
                } catch (e) {
                    this.logger.warn('Failed processing an expiring assignment', e);
                }
            }

<<<<<<< HEAD
            this.logger.log(`ShiftExpiryScheduler processed ${assignments.length} assignments (next ${days} days)`);
=======
            this.logger.log(`ShiftExpiryScheduler processed ${assignments.length} assignments, created ${notificationCount} notifications (next ${days} days)`);
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
        } catch (error) {
            this.logger.error('ShiftExpiryScheduler failed', error);
        }
    }
<<<<<<< HEAD
=======

    /**
     * Automatically find all HR/Admin users in the system
     * No configuration required!
     */
    private async findHRUsers(): Promise<any[]> {
        try {
            if (!this.connection.db) {
                this.logger.warn('Database connection not available');
                return [];
            }

            const hrRoles = await this.connection.db.collection('employeesystemroles').find({
                roles: { $in: ['HR Manager', 'System Admin', 'HR Admin'] },
                isActive: true
            }).toArray();

            if (!hrRoles || hrRoles.length === 0) {
                return [];
            }

            // Get employee details for logging
            const employeeIds = hrRoles.map((r: any) => r.employeeProfileId);
            const employees = await this.connection.db.collection('employeeprofiles').find({
                _id: { $in: employeeIds },
                isActive: true
            }).toArray();

            return hrRoles.map((role: any) => {
                const emp: any = employees.find((e: any) => e._id.equals(role.employeeProfileId));
                return {
                    employeeProfileId: role.employeeProfileId,
                    roles: role.roles,
                    workEmail: emp?.workEmail,
                    isActive: emp?.isActive
                };
            }).filter(u => u.isActive); // Only active employees
        } catch (error) {
            this.logger.error('Failed to find HR users', error);
            return [];
        }
    }
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
}
