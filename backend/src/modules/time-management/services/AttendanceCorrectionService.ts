import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    AttendanceCorrectionRequest,
    AttendanceCorrectionRequestDocument,
} from '../models/attendance-correction-request.schema';
import {
    AttendanceRecord,
    AttendanceRecordDocument,
} from '../models/attendance-record.schema';
import {
    TimeException,
    TimeExceptionDocument,
} from '../models/time-exception.schema';

import {
    CorrectionRequestStatus,
    TimeExceptionStatus,
    TimeExceptionType,
} from '../models/enums';

import { NotificationLog } from '../models/notification-log.schema';

import {
    RequestCorrectionDto,
    ReviewCorrectionDto,
} from '../dto/AttendanceCorrectionDtos';

@Injectable()
export class AttendanceCorrectionService {
    constructor(
        @InjectModel(AttendanceCorrectionRequest.name)
        private readonly correctionModel: Model<AttendanceCorrectionRequestDocument>,

        @InjectModel(AttendanceRecord.name)
        private readonly attendanceModel: Model<AttendanceRecordDocument>,

        @InjectModel(TimeException.name)
        private readonly exceptionModel: Model<TimeExceptionDocument>,

        @InjectModel(NotificationLog.name)
        private readonly notificationModel: Model<any>,
    ) {}

    // ===============================================================
    // 1) SUBMIT CORRECTION REQUEST  (Employee)
    // ===============================================================
    async requestCorrection(dto: RequestCorrectionDto): Promise<AttendanceCorrectionRequest> {
        const { employeeId, attendanceRecordId, reason } = dto;

        const attendance = await this.attendanceModel.findById(attendanceRecordId);
        if (!attendance) throw new NotFoundException('Attendance record not found');

        if (attendance.employeeId.toString() !== employeeId) {
            throw new BadRequestException(
                'Attendance record does not belong to this employee',
            );
        }

        const existing = await this.correctionModel.findOne({
            attendanceRecord: attendance._id,
            status: { $in: [CorrectionRequestStatus.SUBMITTED, CorrectionRequestStatus.IN_REVIEW] },
        });

        if (existing) {
            throw new BadRequestException(
                'A correction request is already pending for this record',
            );
        }

        const request = new this.correctionModel({
            employeeId: new Types.ObjectId(employeeId),
            attendanceRecord: attendance._id,
            reason,
            status: CorrectionRequestStatus.SUBMITTED,
        });

        // Freeze for payroll
        attendance.finalisedForPayroll = false;
        await attendance.save();

        // Optional notification
        await this.notificationModel.create({
            to: attendance.employeeId,
            type: 'CORRECTION_REQUEST_SUBMITTED',
            message: `Correction request submitted for attendance ${attendance._id}`,
        });

        return await request.save();
    }

    // ===============================================================
    // 2) REVIEW / APPROVE / REJECT CORRECTION  (Manager)
    // ===============================================================
    async reviewCorrection(dto: ReviewCorrectionDto) {
        const { correctionRequestId, action, reviewerId, note } = dto;

        const request = await this.correctionModel.findById(correctionRequestId);
        if (!request) throw new NotFoundException('Correction request not found');

        if (
            request.status !== CorrectionRequestStatus.SUBMITTED &&
            request.status !== CorrectionRequestStatus.IN_REVIEW
        ) {
            throw new BadRequestException('Correction request already processed');
        }

        request.status = CorrectionRequestStatus.IN_REVIEW;
        await request.save();

        const attendance = await this.attendanceModel.findById(
            request.attendanceRecord,
        );

        if (!attendance) {
            throw new NotFoundException('Attendance record missing');
        }

        if (action === 'APPROVE') {
            request.status = CorrectionRequestStatus.APPROVED;

            // Resolve Time Exception
            const ex = await this.exceptionModel.findOne({
                attendanceRecordId: attendance._id,
                status: { $ne: TimeExceptionStatus.RESOLVED },
            });

            if (ex) {
                ex.status = TimeExceptionStatus.RESOLVED;
                ex.reason = `Resolved via correction approval: ${note || ''}`;
                await ex.save();
            }

            // Release for payroll
            attendance.finalisedForPayroll = true;
            await attendance.save();

            // Notify employee
            await this.notificationModel.create({
                to: request.employeeId,
                type: 'CORRECTION_APPROVED',
                message: `Your correction request was approved.`,
            });
        } else {
            // REJECT
            request.status = CorrectionRequestStatus.REJECTED;

            await this.notificationModel.create({
                to: request.employeeId,
                type: 'CORRECTION_REJECTED',
                message: `Your correction request was rejected.`,
            });
        }

        if (note) (request as any).reviewNote = note;
        (request as any).reviewerId = reviewerId;

        return await request.save();
    }

    // ===============================================================
    // 3) GET ALL CORRECTIONS FOR EMPLOYEE
    // ===============================================================
    async getEmployeeCorrections(employeeId: string) {
        return await this.correctionModel
            .find({ employeeId: new Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 });
    }

    // ===============================================================
    // 4) GET ALL PENDING CORRECTIONS (Manager dashboard)
    // ===============================================================
    async getPendingCorrections() {
        return await this.correctionModel.find({
            status: { $in: [CorrectionRequestStatus.SUBMITTED, CorrectionRequestStatus.IN_REVIEW] },
        });
    }
}
