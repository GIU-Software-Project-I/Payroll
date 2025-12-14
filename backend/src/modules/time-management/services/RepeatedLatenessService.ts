// src/time-management/repeated-lateness/repeated-lateness.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimeException, TimeExceptionDocument } from '../models/time-exception.schema';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';
import { NotificationLog } from '../models/notification-log.schema';
import { AttendanceRecord, AttendanceRecordDocument } from '../models/attendance-record.schema';

@Injectable()
export class RepeatedLatenessService {
    private readonly logger = new Logger(RepeatedLatenessService.name);

    constructor(
        @InjectModel(TimeException.name) private readonly exceptionModel: Model<TimeExceptionDocument>,
        @InjectModel(AttendanceRecord.name) private readonly attendanceModel: Model<AttendanceRecordDocument>,
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLog>,
    ) {}

    /**
     * Check repeated lateness for an employee within a rolling window (days).
     * If threshold reached, mark found LATE exceptions as ESCALATED and create a NotificationLog,
     * and also create a summary TimeException of type MANUAL_ADJUSTMENT with reason REPEATED_LATENESS (if desired).
     */
    async evaluateAndEscalateIfNeeded(employeeId: Types.ObjectId | string, opts?: {
        windowDays?: number; threshold?: number;
        notifyHrId?: Types.ObjectId | string | null;
    }) {
        const windowDays = opts?.windowDays ?? Number(process.env.LATENESS_THRESHOLD_WINDOW_DAYS ?? 90);
        const threshold = opts?.threshold ?? Number(process.env.LATENESS_THRESHOLD_OCCURRENCES ?? 3);

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - windowDays);

        const matchEmployee = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;

        // Find LATE exceptions (status not RESOLVED) within window so we can later attach summary to their attendance records
        const lateExceptions = await this.exceptionModel.find({
            employeeId: matchEmployee,
            type: TimeExceptionType.LATE,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: TimeExceptionStatus.RESOLVED },
        }).lean();
        const lateCount = lateExceptions.length;

        this.logger.debug(`Employee ${matchEmployee} has ${lateCount} late exceptions in last ${windowDays} days`);

        if (lateCount < threshold) return { escalated: false, count: lateCount };

        // Avoid duplicate escalation: check if there's already a REPEATED_LATENESS escalation (we use a TimeException with reason marker)
        const existingEscalation = await this.exceptionModel.findOne({
            employeeId: matchEmployee,
            // use MANUAL_ADJUSTMENT as a generic type or create special reason
            type: TimeExceptionType.MANUAL_ADJUSTMENT,
            reason: { $regex: 'REPEATED_LATENESS_ESCALATION', $options: 'i' },
        }).lean();

        if (existingEscalation) {
            this.logger.debug(`Repeated lateness already escalated for ${matchEmployee}`);
            return { escalated: false, count: lateCount, alreadyEscalated: true };
        }

        // Mark existing LATE exceptions as ESCALATED (so they won't be re-processed)
        await this.exceptionModel.updateMany({
            employeeId: matchEmployee,
            type: TimeExceptionType.LATE,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: TimeExceptionStatus.RESOLVED },
        }, {
            $set: { status: TimeExceptionStatus.ESCALATED }
        });

        // Create a summary/manual exception to record the escalation (this uses your existing type set)
        try {
            const summary = await this.exceptionModel.create({
                employeeId: matchEmployee,
                attendanceRecordId: null, // no single attendance record: optional
                type: TimeExceptionType.MANUAL_ADJUSTMENT,
                assignedTo: opts?.notifyHrId ? (typeof opts.notifyHrId === 'string' ? new Types.ObjectId(opts.notifyHrId) : opts.notifyHrId) : undefined,
                status: TimeExceptionStatus.ESCALATED,
                reason: `REPEATED_LATENESS_ESCALATION: ${lateCount} lateness events in ${windowDays} days`,
            } as any);
            // Attach the summary exception id to any attendance records referenced by the escalated late exceptions
            try {
                const attendanceIds = Array.from(new Set(lateExceptions.map(e => (e.attendanceRecordId || null)).filter(Boolean).map(String)));
                for (const attId of attendanceIds) {
                    try {
                        const att = await this.attendanceModel.findById(attId as any);
                        if (att) {
                            att.exceptionIds = att.exceptionIds || [];
                            const exists = att.exceptionIds.some(id => id?.toString?.() === (summary as any)._id.toString());
                            if (!exists) att.exceptionIds.push((summary as any)._id as any);
                            att.finalisedForPayroll = false;
                            await att.save();
                        }
                    } catch (inner) {
                        this.logger.warn(`Failed to attach summary exception to attendance ${attId}`, inner);
                    }
                }
            } catch (attachErr) {
                this.logger.warn('Failed to attach summary exception to attendance records', attachErr);
            }
            // Notify HR / manager via NotificationLog (recipient passed in opts or env)
            const hrId = opts?.notifyHrId
                ? (typeof opts.notifyHrId === 'string' ? new Types.ObjectId(opts.notifyHrId) : opts.notifyHrId)
                : (process.env.HR_USER_ID ? new Types.ObjectId(process.env.HR_USER_ID) : undefined);

            if (hrId) {
                await this.notificationModel.create({
                    to: hrId,
                    type: 'REPEATED_LATENESS',
                    message: `Employee ${matchEmployee} has ${lateCount} late events in ${windowDays} days. Escalation created (${(summary as any)._id}).`,
                } as any);
            }
        } catch (e) {
            this.logger.error('Failed to create summary escalation exception / notification', e);
        }

        return { escalated: true, count: lateCount };
    }

    /**
     * Helper to get count for an employee (for UI or reporting)
     */
    async getLateCount(employeeId: Types.ObjectId | string) {
        // Count all LATE exceptions for the employee (no time window)
        const matchEmployee = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;
        const count = await this.exceptionModel.countDocuments({
            employeeId: matchEmployee,
            type: TimeExceptionType.LATE,
            status: { $ne: TimeExceptionStatus.RESOLVED },
        });
        return count;
    }
}