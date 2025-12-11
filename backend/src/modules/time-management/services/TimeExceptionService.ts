// src/time-management/time-exception/time-exception.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TimeException, TimeExceptionDocument } from '../models/time-exception.schema';
import { AttendanceRecord, AttendanceRecordDocument } from '../models/attendance-record.schema';
import { NotificationLog, NotificationLogDocument } from '../models/notification-log.schema';

import { CreateExceptionDto, AssignExceptionDto, UpdateExceptionStatusDto, ExceptionQueryDto } from '../dto/TimeExceptionDtos';
import { TimeExceptionStatus, TimeExceptionType } from '../models/enums';

@Injectable()
export class TimeExceptionService {
    private readonly logger = new Logger(TimeExceptionService.name);

    constructor(
        @InjectModel(TimeException.name) private readonly exceptionModel: Model<TimeExceptionDocument>,
        @InjectModel(AttendanceRecord.name) private readonly attendanceModel: Model<AttendanceRecordDocument>,
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLogDocument>,
    ) {}

    // Create an exception (manual or system)
    async createException(dto: CreateExceptionDto): Promise<TimeException> {
        // basic validation
        if (!Types.ObjectId.isValid(dto.employeeId) || !Types.ObjectId.isValid(dto.attendanceRecordId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const attendance = await this.attendanceModel.findById(dto.attendanceRecordId);
        if (!attendance) throw new NotFoundException('Attendance record not found');

        const ex = await this.exceptionModel.create({
            employeeId: new Types.ObjectId(dto.employeeId),
            attendanceRecordId: new Types.ObjectId(dto.attendanceRecordId),
            type: dto.type,
            assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : await this.systemAssigneeFallback(dto.employeeId),
            status: TimeExceptionStatus.OPEN,
            reason: dto.reason ?? '',
        } as any);

        // attach to attendance
        attendance.exceptionIds = attendance.exceptionIds || [];
        attendance.exceptionIds.push(ex._id);
        attendance.finalisedForPayroll = false;
        await attendance.save();

        // notification log
        try {
            await this.notificationModel.create({
                to: ex.assignedTo,
                type: 'TIME_EXCEPTION_CREATED',
                message: `Time exception ${ex._id} created for attendance ${attendance._id}`,
            });
        } catch (e) {
            this.logger.warn('Failed to create notification for exception', e);
        }

        return ex.toObject() as TimeException;
    }

    // small helper: choose system fallback assignee (employee or system)
    private async systemAssigneeFallback(employeeId: string | Types.ObjectId): Promise<Types.ObjectId> {
        const system = process.env.SYSTEM_USER_ID;
        if (system && Types.ObjectId.isValid(system)) return new Types.ObjectId(system);
        return typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : (employeeId as Types.ObjectId);
    }

    // Get a single exception
    async getException(id: string): Promise<TimeException> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
        const ex = await this.exceptionModel.findById(id);
        if (!ex) throw new NotFoundException('Exception not found');
        return ex.toObject() as TimeException;
    }

    // List / query exceptions
    async listExceptions(query: ExceptionQueryDto = {}): Promise<TimeException[]> {
        const filter: any = {};
        if (query.status) filter.status = query.status;
        if (query.type) filter.type = query.type;
        if (query.employeeId) filter.employeeId = new Types.ObjectId(query.employeeId);
        if (query.assignedTo) filter.assignedTo = new Types.ObjectId(query.assignedTo);

        const results = await this.exceptionModel.find(filter).sort({ _id: -1 });
        return results.map(r => r.toObject() as TimeException);
    }

    // Assign/claim an exception to a handler
    async assignException(dto: AssignExceptionDto): Promise<TimeException> {
        if (!Types.ObjectId.isValid(dto.exceptionId) || !Types.ObjectId.isValid(dto.assigneeId)) {
            throw new BadRequestException('Invalid IDs');
        }
        const ex = await this.exceptionModel.findById(dto.exceptionId);
        if (!ex) throw new NotFoundException('Exception not found');

        ex.assignedTo = new Types.ObjectId(dto.assigneeId);
        // optionally move status to PENDING when assigned
        if (ex.status === TimeExceptionStatus.OPEN) ex.status = TimeExceptionStatus.PENDING;
        await ex.save();

        // notify assignee
        try {
            await this.notificationModel.create({
                to: ex.assignedTo,
                type: 'TIME_EXCEPTION_ASSIGNED',
                message: `Exception ${ex._id} assigned to you.`,
            });
        } catch (e) { this.logger.warn('notification failed', e); }

        return ex.toObject() as TimeException;
    }

    // Update status (approve/reject/escalate/resolve)
    async updateStatus(dto: UpdateExceptionStatusDto): Promise<TimeException> {
        const { exceptionId, status, comment } = dto;
        if (!Types.ObjectId.isValid(exceptionId)) throw new BadRequestException('Invalid id');

        const ex = await this.exceptionModel.findById(exceptionId);
        if (!ex) throw new NotFoundException('Exception not found');

        // Enforce allowed transitions (simple approach)
        const allowed = this.allowedTransition(ex.status, status);
        if (!allowed) throw new BadRequestException(`Cannot transition from ${ex.status} to ${status}`);

        ex.status = status;
        if (comment) (ex as any).handlerComment = comment;
        await ex.save();

        // If resolved, update linked attendance record
        if (status === TimeExceptionStatus.RESOLVED) {
            await this.onResolved(ex);
        }

        // Notification
        try {
            await this.notificationModel.create({
                to: ex.employeeId,
                type: `TIME_EXCEPTION_${status}`,
                message: `Your time exception ${ex._id} status changed to ${status}`,
            });
        } catch (e) { this.logger.warn('notification failed', e); }

        return ex.toObject() as TimeException;
    }

    // Allowed transition map (small & clear)
    private allowedTransition(from: TimeExceptionStatus, to: TimeExceptionStatus): boolean {
        const map: Record<TimeExceptionStatus, TimeExceptionStatus[]> = {
            [TimeExceptionStatus.OPEN]: [TimeExceptionStatus.PENDING, TimeExceptionStatus.ESCALATED, TimeExceptionStatus.RESOLVED],
            [TimeExceptionStatus.PENDING]: [TimeExceptionStatus.APPROVED, TimeExceptionStatus.REJECTED, TimeExceptionStatus.ESCALATED, TimeExceptionStatus.RESOLVED],
            [TimeExceptionStatus.APPROVED]: [TimeExceptionStatus.RESOLVED, TimeExceptionStatus.ESCALATED],
            [TimeExceptionStatus.REJECTED]: [],
            [TimeExceptionStatus.ESCALATED]: [TimeExceptionStatus.PENDING, TimeExceptionStatus.RESOLVED],
            [TimeExceptionStatus.RESOLVED]: [],
        };
        return (map[from] || []).includes(to);
    }

    // When resolved: update attendance record (remove exception from open list and maybe re-finalise)
    private async onResolved(exDoc: TimeExceptionDocument) {
        try {
            const att = await this.attendanceModel.findById(exDoc.attendanceRecordId);
            if (!att) return;

            // If this was a SHORT_TIME exception, and the attendance now meets scheduled minutes, delete the exception document
            if (exDoc.type === TimeExceptionType.SHORT_TIME) {
                try {
                    // Determine attendance day
                    const recDate = (att.punches && att.punches.length) ? new Date(att.punches[0].time) : (att as any)._id?.getTimestamp?.() || new Date();
                    const dayStart = new Date(recDate); dayStart.setHours(0,0,0,0);
                    const dayEnd = new Date(recDate); dayEnd.setHours(23,59,59,999);

                    // Find assignment for the day
                    const assignment = await this.attendanceModel.db.model('ShiftAssignment').findOne({
                        employeeId: att.employeeId,
                        status: { $in: ['PENDING', 'APPROVED'] },
                        startDate: { $lte: dayEnd },
                        $or: [{ endDate: { $exists: false } }, { endDate: { $gte: dayStart } }],
                    }).lean();

                    if (assignment) {
                        // load shift
                        const ShiftModel = this.attendanceModel.db.model('Shift') as any;
                        const shift = await ShiftModel.findById((assignment as any).shiftId).lean() as any;
                        if (shift) {
                            const [sh, sm] = (shift.startTime || '00:00').split(':').map(Number);
                            const [eh, em] = (shift.endTime || '00:00').split(':').map(Number);

                            const scheduledStart = new Date(recDate); scheduledStart.setHours(sh, sm, 0, 0);
                            const scheduledEnd = new Date(recDate); scheduledEnd.setHours(eh, em, 0, 0);
                            if (scheduledEnd.getTime() <= scheduledStart.getTime()) scheduledEnd.setDate(scheduledEnd.getDate() + 1);

                            const overlapStart = new Date(Math.max(scheduledStart.getTime(), dayStart.getTime()));
                            const overlapEnd = new Date(Math.min(scheduledEnd.getTime(), dayEnd.getTime()));

                            const scheduledMinutes = (overlapEnd.getTime() > overlapStart.getTime()) ? Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / 60000) : 0;

                            // If attendance totalWorkMinutes >= scheduledMinutes, delete the SHORT_TIME exception doc
                            if ((att as any).totalWorkMinutes >= scheduledMinutes) {
                                try {
                                    await this.exceptionModel.deleteOne({ _id: exDoc._id });
                                } catch (e) {
                                    this.logger.warn('Failed to delete SHORT_TIME exception after resolution check', e);
                                }

                                // Remove from attendance.exceptionIds
                                try {
                                    att.exceptionIds = (att.exceptionIds || []).filter(id => String(id) !== String(exDoc._id));
                                    // If no other open exceptions, allow finalisation
                                    const otherOpen = await this.exceptionModel.findOne({ attendanceRecordId: att._id, status: { $ne: TimeExceptionStatus.RESOLVED } });
                                    if (!otherOpen) att.finalisedForPayroll = true;
                                    await att.save();
                                } catch (e) {
                                    this.logger.warn('Failed to remove SHORT_TIME id reference from attendance after deleting exception', e);
                                }

                                return; // we're done
                            }
                        }
                    }
                } catch (e) {
                    this.logger.warn('SHORT_TIME post-resolve removal check failed', e);
                }
            }

            // Default behavior: leave id in array for audit but ensure payroll flag may be reset
            // Recompute finalisedForPayroll: check if other open exceptions remain for this att
            const otherOpen = await this.exceptionModel.findOne({
                attendanceRecordId: att._id,
                status: { $ne: TimeExceptionStatus.RESOLVED },
            });

            if (!otherOpen) {
                // No other open exceptions: allow finalisation
                att.finalisedForPayroll = true;
            }

            await att.save();
        } catch (e) {
            this.logger.error('onResolved failed', e);
        }
    }
}
