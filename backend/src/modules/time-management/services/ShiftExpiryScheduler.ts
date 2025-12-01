// src/time-management/shift-management/shift-expiry.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShiftAssignment, ShiftAssignmentDocument } from '../models/shift-assignment.schema';
import { NotificationLog, NotificationLogDocument } from '../models/notification-log.schema';

/**
 * ShiftExpiryScheduler
 * - runs daily and creates NotificationLog entries for assignments that will expire within the configured window
 */
@Injectable()
export class ShiftExpiryScheduler {
    private readonly logger = new Logger(ShiftExpiryScheduler.name);

    constructor(
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLogDocument>,
    ) {}

    /**
     * Runs daily at configured hour.
     * CRON: default '0 8 * * *' (08:00 server time).
     * Use env SHIFT_EXPIRY_NOTIFICATION_HOUR to override (HH:mm).
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
                        } catch (e) {
                            this.logger.warn('Failed to create notification for employee', e);
                        }
                    }
                } catch (e) {
                    this.logger.warn('Failed processing an expiring assignment', e);
                }
            }

            this.logger.log(`ShiftExpiryScheduler processed ${assignments.length} assignments (next ${days} days)`);
        } catch (error) {
            this.logger.error('ShiftExpiryScheduler failed', error);
        }
    }
}
