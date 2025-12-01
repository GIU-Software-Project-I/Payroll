// src/time-management/attendance/attendance.service.ts

import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    AttendanceRecord,
    AttendanceRecordDocument,
} from '../models/attendance-record.schema';

import {
    TimeException,
    TimeExceptionDocument,
} from '../models/time-exception.schema';

import {
    AttendanceCorrectionRequest,
    AttendanceCorrectionRequestDocument,
} from '../models/attendance-correction-request.schema';

import {
    NotificationLog,
    NotificationLogDocument,
} from '../models/notification-log.schema';

import {
    ShiftAssignment,
    ShiftAssignmentDocument,
} from '../models/shift-assignment.schema';

import { Shift, ShiftDocument } from '../models/shift.schema';

import {
    LatenessRule,
    LatenessRuleDocument,
} from '../models/lateness-rule.schema';

import {
    OvertimeRule,
    OvertimeRuleDocument,
} from '../models/overtime-rule.schema';

import {
    PunchInDto,
    PunchOutDto,
    UpdateAttendanceRecordDto,
} from '../dto/AttendanceDtos';

import {
    PunchType,
    TimeExceptionType,
    TimeExceptionStatus,
} from '../models/enums';
import {HolidayService} from "./HolidayService";
import {RepeatedLatenessService} from "./RepeatedLatenessService";





@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(
        @InjectModel(AttendanceRecord.name)
        private readonly attendanceModel: Model<AttendanceRecordDocument>,

        @InjectModel(TimeException.name)
        private readonly exceptionModel: Model<TimeExceptionDocument>,

        @InjectModel(AttendanceCorrectionRequest.name)
        private readonly correctionModel: Model<AttendanceCorrectionRequestDocument>,

        @InjectModel(NotificationLog.name)
        private readonly notificationModel: Model<NotificationLogDocument>,

        @InjectModel(ShiftAssignment.name)
        private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,

        @InjectModel(Shift.name)
        private readonly shiftModel: Model<ShiftDocument>,

        @InjectModel(LatenessRule.name)
        private readonly latenessRuleModel: Model<LatenessRuleDocument>,

        @InjectModel(OvertimeRule.name)
        private readonly overtimeRuleModel: Model<OvertimeRuleDocument>,

        private readonly holidayService: HolidayService,

        private readonly repeatedLatenessService: RepeatedLatenessService,
    ) {}

    // ============================================================
    // UTILITIES
    // ============================================================

    /**
     * Parse date string in format dd/mm/yyyy hh:mm
     * @param dateStr - Date string in format dd/mm/yyyy hh:mm
     * @returns Date object or null if invalid
     */
    private parseCustomDateFormat(dateStr: string | Date | undefined): Date | null {
        if (!dateStr) return null;

        // If already a Date object, return it
        if (dateStr instanceof Date) return dateStr;

        // Try parsing custom format: dd/mm/yyyy hh:mm
        const customFormatRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
        const match = dateStr.match(customFormatRegex);

        if (match) {
            const [, day, month, year, hours, minutes] = match;
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1, // months are 0-indexed
                parseInt(day),
                parseInt(hours),
                parseInt(minutes)
            );

            // Validate the date is valid
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Fallback: try parsing as ISO string or standard format
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
        } catch (e) {
            // Invalid date
        }

        return null;
    }

    /**
     * Format date to dd/mm/yyyy hh:mm
     * @param date - Date object
     * @returns Formatted string
     */
    private formatCustomDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    private getRecordDate(att: AttendanceRecord): Date {
        if (att.punches?.length > 0) {
            const sorted = att.punches
                .slice()
                .sort((a, b) => +new Date(a.time) - +new Date(b.time));
            return new Date(sorted[0].time);
        }
        try {
            const ts = (att as any)._id?.getTimestamp?.();
            if (ts) return ts;
        } catch {}
        return new Date();
    }

    private async resolveAssigneeForEmployee(id: string | Types.ObjectId) {
        const sys = process.env.SYSTEM_USER_ID;
        if (sys) return new Types.ObjectId(sys);
        return typeof id === 'string' ? new Types.ObjectId(id) : id;
    }

    private async createTimeExceptionAuto(params: {
        employeeId: string | Types.ObjectId;
        attendanceRecordId: Types.ObjectId | null;
        type: TimeExceptionType;
        reason?: string;
    }) {
        const assignedTo = await this.resolveAssigneeForEmployee(params.employeeId);

        const ex = await this.exceptionModel.create({
            employeeId:
                typeof params.employeeId === 'string'
                    ? new Types.ObjectId(params.employeeId)
                    : params.employeeId,
            attendanceRecordId: params.attendanceRecordId ?? undefined,
            type: params.type,
            assignedTo,
            status: TimeExceptionStatus.OPEN,
            reason: params.reason || 'Auto-created',
        } as Partial<TimeException>);

        return ex.toObject() as TimeException;
    }

    // replace your existing findOrCreateRecord with this implementation
    // inside AttendanceService class
    private async findOrCreateRecord(employeeId: string, date: Date) {
        // canonical day-range for the provided date (use the passed 'date' as authoritative)
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const empOid = new Types.ObjectId(employeeId);

        this.logger.debug(`findOrCreateRecord: looking for record on ${start.toISOString()} to ${end.toISOString()}`);

        // 1) Find ALL records for this employee that have at least one punch in the target day
        const candidates = await this.attendanceModel.find({
            employeeId: empOid,
            'punches.time': { $gte: start, $lte: end },
        });

        this.logger.debug(`findOrCreateRecord: found ${candidates.length} candidate record(s) with punches in date range`);

        // 2) Check each candidate to ensure ALL punches are within the target day
        for (const candidate of candidates) {
            if (!candidate.punches || candidate.punches.length === 0) {
                // Empty record - can use it
                this.logger.debug(`findOrCreateRecord: using empty record ${candidate._id}`);
                return candidate;
            }

            // Verify that ALL punches are within the target day
            const allPunchesInDay = candidate.punches.every(p => {
                const punchTime = new Date(p.time);
                const isInRange = punchTime >= start && punchTime <= end;
                if (!isInRange) {
                    this.logger.debug(`findOrCreateRecord: record ${candidate._id} has punch outside range: ${punchTime.toISOString()}`);
                }
                return isInRange;
            });

            if (allPunchesInDay) {
                this.logger.debug(`findOrCreateRecord: matched record ${candidate._id} - all ${candidate.punches.length} punches are within target day`);
                return candidate;
            } else {
                this.logger.warn(`findOrCreateRecord: record ${candidate._id} spans multiple days - this should not happen! Skipping it.`);
            }
        }

        // 3) Try to find an empty record created on this day (if createdAt exists)
        const emptyRecords = await this.attendanceModel.find({
            employeeId: empOid,
            $or: [
                { punches: { $exists: false } },
                { punches: { $size: 0 } }
            ],
            createdAt: { $gte: start, $lte: end } as any,
        });

        if (emptyRecords.length > 0) {
            this.logger.debug(`findOrCreateRecord: found empty record by createdAt ${emptyRecords[0]._id}`);
            return emptyRecords[0];
        }

        // 4) Nothing found: create a fresh attendance record for that employee/day
        const doc = new this.attendanceModel({
            employeeId: empOid,
            punches: [],
            totalWorkMinutes: 0,
            hasMissedPunch: false,
            exceptionIds: [],
            finalisedForPayroll: true,
        });

        const saved = await doc.save();
        this.logger.debug(`findOrCreateRecord: created new attendance record for ${employeeId} on ${start.toISOString()} -> ${saved._id}`);
        return saved;
    }

    // ============================================================
    // PUNCH LOGIC
    // ============================================================
    // inside AttendanceService class

    async punchIn(dto: PunchInDto) {
        if (!dto.employeeId) throw new BadRequestException('employeeId required');

        // 1) canonicalize timestamp - parse custom format if provided
        let now: Date;
        if (dto.time) {
            const parsed = this.parseCustomDateFormat(dto.time as any);
            if (!parsed) {
                throw new BadRequestException('Invalid time format. Expected format: dd/mm/yyyy hh:mm (e.g., 01/12/2025 14:30)');
            }
            now = parsed;
        } else {
            now = new Date();
        }

        // 2) find or create the attendance record for this employee/day (findOrCreateRecord should accept Date)
        const rec = await this.findOrCreateRecord(dto.employeeId, now);
        if (!rec) {
            throw new NotFoundException('Unable to create or find attendance record');
        }

        // 3) load authoritative doc
        const attendance = await this.attendanceModel.findById(rec._id);
        if (!attendance) {
            // extremely unlikely because findOrCreateRecord returns a saved doc, but guard anyway
            throw new NotFoundException('Attendance record not found after creation');
        }

        this.logger.debug(`punchIn: using attendance record ${attendance._id} for employee ${String(attendance.employeeId)} at ${now.toISOString()}`);

        // 4) Validate that the punch time is on the same calendar day as existing punches
        if (attendance.punches && attendance.punches.length > 0) {
            const firstPunchDate = new Date(attendance.punches[0].time);
            const firstPunchDayStart = new Date(firstPunchDate);
            firstPunchDayStart.setHours(0, 0, 0, 0);
            const firstPunchDayEnd = new Date(firstPunchDate);
            firstPunchDayEnd.setHours(23, 59, 59, 999);

            if (now < firstPunchDayStart || now > firstPunchDayEnd) {
                this.logger.error(`punchIn: Attempted to add punch on different day! Record ${attendance._id} has punches from ${firstPunchDate.toISOString()}, but trying to add punch at ${now.toISOString()}`);
                throw new BadRequestException('Cannot add punch to a different day. Please contact support if you see this error.');
            }
        }

        // 5) prepare punches list & lastPunch
        const punches = (attendance.punches || []).slice().sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const lastPunch = punches.length ? punches[punches.length - 1] : null;

        // 6) Chronological validation
        if (lastPunch && now.getTime() < new Date(lastPunch.time).getTime()) {
            throw new BadRequestException('Punch time cannot be earlier than last recorded punch');
        }

        // 7) Prevent duplicate exact timestamp IN
        if (punches.some(p => +new Date(p.time) === +now.getTime() && p.type === PunchType.IN)) {
            throw new BadRequestException('Duplicate IN punch at same timestamp');
        }

        // 7.5) NATURAL SEQUENCE VALIDATION: You can only punch IN if:
        //      - There are no punches yet (first punch of the day), OR
        //      - The last punch was an OUT
        if (lastPunch && lastPunch.type === PunchType.IN) {
            throw new BadRequestException('Cannot punch IN again. You must punch OUT first before punching IN again.');
        }

        // 8) Determine punch policy (use the canonical 'now' to determine the day/assignment)
        let punchPolicy: string | null = null;
        try {
            const recDate = new Date(now);
            const start = new Date(recDate); start.setHours(0, 0, 0, 0);
            const end = new Date(recDate); end.setHours(23, 59, 59, 999);

            const assignment = await this.shiftAssignmentModel.findOne({
                employeeId: attendance.employeeId,
                startDate: { $lte: end },
                $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
            });

            if (assignment) {
                const shift = await this.shiftModel.findById(assignment.shiftId);
                if (shift && (shift as any).punchPolicy) punchPolicy = (shift as any).punchPolicy;
            }
        } catch (e) {
            this.logger.debug('Failed to determine punch policy for punchIn; defaulting to FIRST_LAST', e);
        }
        if (!punchPolicy) punchPolicy = 'FIRST_LAST';

        // 9) Enforce policy rules for IN
        if (punchPolicy === 'ONLY_FIRST') {
            if (punches.length > 0) {
                throw new BadRequestException('Punch policy forbids additional punches after the first punch of the day');
            }
        } else if (punchPolicy === 'FIRST_LAST') {
            const inCount = punches.filter(p => p.type === PunchType.IN).length;
            if (inCount >= 1) {
                throw new BadRequestException('Punch policy allows only first IN and last OUT — IN already recorded for the day');
            }
        } // MULTIPLE -> allowed

        // 10) Append IN punch (store a Date object)
        await this.attendanceModel.updateOne(
            { _id: attendance._id },
            { $push: { punches: { type: PunchType.IN, time: new Date(now) } } },
        );

        // 11) Recompute totals / exceptions and return updated doc
        await this.recompute(attendance._id);

        return (await this.attendanceModel.findById(attendance._id))!.toObject();
    }


    async punchOut(dto: PunchOutDto) {
        if (!dto.employeeId) throw new BadRequestException('employeeId required');

        // 1) canonicalize timestamp - parse custom format if provided
        let now: Date;
        if (dto.time) {
            const parsed = this.parseCustomDateFormat(dto.time as any);
            if (!parsed) {
                throw new BadRequestException('Invalid time format. Expected format: dd/mm/yyyy hh:mm (e.g., 01/12/2025 18:30)');
            }
            now = parsed;
        } else {
            now = new Date();
        }

        // 2) find or create the attendance record for this employee/day
        const rec = await this.findOrCreateRecord(dto.employeeId, now);
        if (!rec) {
            throw new NotFoundException('Unable to create or find attendance record');
        }

        // 3) load authoritative doc
        const attendance = await this.attendanceModel.findById(rec._id);
        if (!attendance) throw new NotFoundException('Attendance record not found');

        this.logger.debug(`punchOut: using attendance record ${attendance._id} for employee ${String(attendance.employeeId)} at ${now.toISOString()}`);

        // 4) Validate that the punch time is on the same calendar day as existing punches
        if (attendance.punches && attendance.punches.length > 0) {
            const firstPunchDate = new Date(attendance.punches[0].time);
            const firstPunchDayStart = new Date(firstPunchDate);
            firstPunchDayStart.setHours(0, 0, 0, 0);
            const firstPunchDayEnd = new Date(firstPunchDate);
            firstPunchDayEnd.setHours(23, 59, 59, 999);

            if (now < firstPunchDayStart || now > firstPunchDayEnd) {
                this.logger.error(`punchOut: Attempted to add punch on different day! Record ${attendance._id} has punches from ${firstPunchDate.toISOString()}, but trying to add punch at ${now.toISOString()}`);
                throw new BadRequestException('Cannot add punch to a different day. Please contact support if you see this error.');
            }
        }

        // 5) prepare punches list & lastPunch
        const punches = (attendance.punches || []).slice().sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const lastPunch = punches.length ? punches[punches.length - 1] : null;

        // 6) Chronological validation
        if (lastPunch && now.getTime() < new Date(lastPunch.time).getTime()) {
            throw new BadRequestException('Punch time cannot be earlier than last recorded punch');
        }

        // 7) Prevent duplicate exact timestamp OUT
        if (punches.some(p => +new Date(p.time) === +now.getTime() && p.type === PunchType.OUT)) {
            throw new BadRequestException('Duplicate OUT punch at same timestamp');
        }

        // 7.5) NATURAL SEQUENCE VALIDATION: You can only punch OUT if:
        //      - The last punch was an IN
        //      - You cannot punch OUT as the first punch (must IN first)
        if (!lastPunch) {
            throw new BadRequestException('Cannot punch OUT. You must punch IN first.');
        }
        if (lastPunch.type === PunchType.OUT) {
            throw new BadRequestException('Cannot punch OUT again. You must punch IN first before punching OUT again.');
        }

        // 8) Determine punch policy (use canonical 'now')
        let punchPolicy: string | null = null;
        try {
            const recDate = new Date(now);
            const start = new Date(recDate); start.setHours(0, 0, 0, 0);
            const end = new Date(recDate); end.setHours(23, 59, 59, 999);

            const assignment = await this.shiftAssignmentModel.findOne({
                employeeId: attendance.employeeId,
                startDate: { $lte: end },
                $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
            });

            if (assignment) {
                const shift = await this.shiftModel.findById(assignment.shiftId);
                if (shift && (shift as any).punchPolicy) punchPolicy = (shift as any).punchPolicy;
            }
        } catch (e) {
            this.logger.debug('Failed to determine punch policy for punchOut; defaulting to FIRST_LAST', e);
        }
        if (!punchPolicy) punchPolicy = 'FIRST_LAST';

        // 9) Enforce policy rules for OUT
        if (punchPolicy === 'ONLY_FIRST') {
            if (punches.length > 0) {
                throw new BadRequestException('Punch policy forbids additional punches after the first punch of the day');
            }
        } else if (punchPolicy === 'FIRST_LAST') {
            const inCount = punches.filter(p => p.type === PunchType.IN).length;
            const outCount = punches.filter(p => p.type === PunchType.OUT).length;

            if (outCount >= 1) {
                throw new BadRequestException('Punch policy allows only first IN and last OUT — OUT already recorded for the day');
            }
            // Note: OUT without IN is now prevented by sequence validation above
        } // MULTIPLE -> allowed


        // 11) Append OUT punch (store a Date object)
        await this.attendanceModel.updateOne(
            { _id: attendance._id },
            { $push: { punches: { type: PunchType.OUT, time: new Date(now) } } },
        );

        // 12) Recompute totals and side effects
        await this.recompute(attendance._id);

        return (await this.attendanceModel.findById(attendance._id))!.toObject();
    }


    // ============================================================
    // CALCULATION LOGIC
    // ============================================================

    computeTotalMinutes(rec: AttendanceRecord) {
        const punches = rec.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));
        if (!punches?.length) return 0;

        let total = 0;
        let i = 0;

        while (i < punches.length) {
            if (punches[i].type === PunchType.IN) {
                const nextOut = punches.slice(i + 1).find((p) => p.type === PunchType.OUT);
                if (!nextOut) break;
                total +=
                    new Date(nextOut.time).getTime() - new Date(punches[i].time).getTime();
                i = punches.indexOf(nextOut) + 1;
            } else i++;
        }

        return Math.round(total / 60000);
    }

    async computeLateness(record: AttendanceRecord) {
        const punches = record.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const firstIn = punches?.find((p) => p.type === PunchType.IN);
        if (!firstIn) return 0;

        const recDate = new Date(firstIn.time);

        // Holiday suppression: if date is holiday -> no lateness
        if (await this.holidayService.isHoliday(recDate)) return 0;

        const start = new Date(recDate); start.setHours(0,0,0,0);
        const end = new Date(recDate); end.setHours(23,59,59,999);

        const asg = await this.shiftAssignmentModel.findOne({
            employeeId: record.employeeId,
            startDate: { $lte: end },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
        });

        if (!asg) return 0;

        const shift = await this.shiftModel.findById(asg.shiftId);
        if (!shift) return 0;

        const [h, m] = (shift.startTime || '00:00').split(':').map(Number);
        const scheduled = new Date(recDate); scheduled.setHours(h, m, 0, 0);

        const rule = await this.latenessRuleModel.findOne({ active: true });
        const grace = shift.graceInMinutes ?? rule?.gracePeriodMinutes ?? 0;

        const diff = new Date(firstIn.time).getTime() - (scheduled.getTime() + grace * 60000);
        return Math.max(0, Math.ceil(diff / 60000));
    }


    async computeEarlyLeave(record: AttendanceRecord) {
        const punches = record.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const lastOut = punches?.reverse().find((p) => p.type === PunchType.OUT);
        if (!lastOut) return 0;

        const recDate = new Date(lastOut.time);

        // Holiday suppression: if date is holiday -> no early-leave penalty
        if (await this.holidayService.isHoliday(recDate)) return 0;

        const start = new Date(recDate); start.setHours(0,0,0,0);
        const end = new Date(recDate); end.setHours(23,59,59,999);

        const asg = await this.shiftAssignmentModel.findOne({
            employeeId: record.employeeId,
            startDate: { $lte: end },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
        });
        if (!asg) return 0;
        const shift = await this.shiftModel.findById(asg.shiftId);
        if (!shift) return 0;

        const [eh, em] = (shift.endTime || '00:00').split(':').map(Number);
        const scheduled = new Date(recDate); scheduled.setHours(eh, em, 0, 0);

        const grace = shift.graceOutMinutes ?? 0;

        const diff = (scheduled.getTime() - grace * 60000) - new Date(lastOut.time).getTime();
        return Math.max(0, Math.ceil(diff / 60000));
    }


    async computeOvertime(record: AttendanceRecord) {
        const punches = record.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const lastOut = punches?.reverse().find((p) => p.type === PunchType.OUT);
        if (!lastOut) return 0;

        const recDate = new Date(lastOut.time);

        const start = new Date(recDate); start.setHours(0,0,0,0);
        const end = new Date(recDate); end.setHours(23,59,59,999);

        const asg = await this.shiftAssignmentModel.findOne({
            employeeId: record.employeeId,
            startDate: { $lte: end },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
        });
        if (!asg) return 0;
        const shift = await this.shiftModel.findById(asg.shiftId);
        if (!shift) return 0;

        const [eh, em] = (shift.endTime || '00:00').split(':').map(Number);
        const scheduledEnd = new Date(recDate); scheduledEnd.setHours(eh, em, 0, 0);

        const diff = new Date(lastOut.time).getTime() - scheduledEnd.getTime();
        const minutes = Math.max(0, Math.ceil(diff / 60000));
        if (minutes <= 0) return 0;

        // If it's a holiday, mark overtime as holiday overtime (no penalties for lateness, but OT may still require approval)
        const isHoliday = await this.holidayService.isHoliday(recDate);

        if (shift.requiresApprovalForOvertime) {
            const rule = await this.overtimeRuleModel.findOne({ active: true });
            if (!rule || !rule.approved) {
                // create an overtime request exception, include holiday info in reason
                await this.createTimeExceptionAuto({
                    employeeId: record.employeeId,
                    attendanceRecordId: (record as any)._id,
                    type: TimeExceptionType.OVERTIME_REQUEST,
                    reason: isHoliday ? 'Holiday overtime - requires approval' : 'Overtime requires approval',
                });
            }
        }

        // Optionally create a holiday-specific OT exception or tag; we keep it as computed minutes return
        return minutes;
    }


    // ============================================================
    // RECOMPUTE
    // ============================================================

    // inside AttendanceService class
    private async recompute(attendanceId: Types.ObjectId | string) {
        const att = await this.attendanceModel.findById(attendanceId);
        if (!att) return;

        // 1) compute total minutes from punches
        const total = this.computeTotalMinutes(att.toObject() as AttendanceRecord);
        att.totalWorkMinutes = total;

        // 2) detect unmatched punches -> potentially MISSED_PUNCH (holiday-aware)
        const punches = (att.punches || []).slice().sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const inCount = punches.filter(p => p.type === PunchType.IN).length;
        const outCount = punches.filter(p => p.type === PunchType.OUT).length;

        // Determine record date from punches (helper)
        const recDate = this.getRecordDate(att.toObject() as AttendanceRecord);
        const isHoliday = await this.holidayService.isHoliday(recDate).catch(err => {
            // on holidayService failure, default to non-holiday to avoid silent suppression
            this.logger.warn('holidayService.isHoliday failed; defaulting to non-holiday', err);
            return false;
        });

        if (inCount > outCount) {
            att.hasMissedPunch = true;
            att.finalisedForPayroll = false;

            // only auto-create MISSED_PUNCH exception if NOT a holiday
            if (!isHoliday) {
                try {
                    const ex = await this.createTimeExceptionAuto({
                        employeeId: att.employeeId,
                        attendanceRecordId: att._id,
                        type: TimeExceptionType.MISSED_PUNCH,
                        reason: 'Unmatched IN',
                    });
                    if (ex) {
                        att.exceptionIds = att.exceptionIds || [];
                        att.exceptionIds.push(new Types.ObjectId((ex as any)._id));
                    }
                } catch (e) {
                    this.logger.warn('Failed to create MISSED_PUNCH exception', e);
                }
            } else {
                this.logger.debug(`Missed punch on holiday for attendance ${att._id} - skipping MISSED_PUNCH exception`);
            }
        } else {
            // If no unmatched INs, ensure hasMissedPunch flag is false (in case previously set)
            att.hasMissedPunch = false;
        }

        // 3) lateness -> create LATE exception if applicable (computeLateness already skips holidays)
        try {
            const lateMinutes = await this.computeLateness(att.toObject() as AttendanceRecord);
            if (lateMinutes > 0) {
                const ex = await this.createTimeExceptionAuto({
                    employeeId: att.employeeId,
                    attendanceRecordId: att._id,
                    type: TimeExceptionType.LATE,
                    reason: `Auto-detected lateness: ${lateMinutes} minutes`,
                });
                if (ex) {
                    att.exceptionIds = att.exceptionIds || [];
                    att.exceptionIds.push(new Types.ObjectId((ex as any)._id));
                    att.finalisedForPayroll = false;
                    try { await this.notificationModel.create({ to: att.employeeId as any, type: 'LATE', message: `You were late by ${lateMinutes} minutes` }); } catch (_) {}

                    // --- Repeated lateness evaluation & escalation (no new schemas) ---
                    try {
                        await this.repeatedLatenessService.evaluateAndEscalateIfNeeded(att.employeeId);
                    } catch (e) {
                        this.logger.warn('Repeated lateness evaluation failed', e);
                    }
                }
            }
        } catch (e) {
            this.logger.warn('computeLateness/recompute LATE handling failed', e);
        }

        // 4) early leave -> create EARLY_LEAVE exception if applicable (computeEarlyLeave skips holidays)
        try {
            const earlyMinutes = await this.computeEarlyLeave(att.toObject() as AttendanceRecord);
            if (earlyMinutes > 0) {
                const ex = await this.createTimeExceptionAuto({
                    employeeId: att.employeeId,
                    attendanceRecordId: att._id,
                    type: TimeExceptionType.EARLY_LEAVE,
                    reason: `Auto-detected early leave: ${earlyMinutes} minutes`,
                });
                if (ex) {
                    att.exceptionIds = att.exceptionIds || [];
                    att.exceptionIds.push(new Types.ObjectId((ex as any)._id));
                    att.finalisedForPayroll = false;
                    try { await this.notificationModel.create({ to: att.employeeId as any, type: 'EARLY_LEAVE', message: `Early leave detected: ${earlyMinutes} minutes` }); } catch (_) {}
                }
            }
        } catch (e) {
            this.logger.warn('computeEarlyLeave/recompute EARLY_LEAVE handling failed', e);
        }

        // 5) short time -> compute scheduled minutes and create SHORT_TIME if needed (skip on holiday)
        try {
            if (!isHoliday) {
                // find assignment for the record date
                const startOfDay = new Date(recDate); startOfDay.setHours(0,0,0,0);
                const endOfDay = new Date(recDate); endOfDay.setHours(23,59,59,999);

                const assignment = await this.shiftAssignmentModel.findOne({
                    employeeId: new Types.ObjectId(att.employeeId as any),
                    status: { $in: ['PENDING', 'APPROVED'] },
                    startDate: { $lte: endOfDay },
                    $or: [{ endDate: { $exists: false } }, { endDate: { $gte: startOfDay } }],
                });

                if (assignment) {
                    const shift = await this.shiftModel.findById(assignment.shiftId);
                    if (shift) {
                        const scheduledMinutes = this.minutesBetweenHHMM(shift.startTime, shift.endTime);
                        const shortMinutes = Math.max(0, scheduledMinutes - att.totalWorkMinutes);
                        if (shortMinutes > 0) {
                            const ex = await this.createTimeExceptionAuto({
                                employeeId: att.employeeId,
                                attendanceRecordId: att._id,
                                type: TimeExceptionType.SHORT_TIME,
                                reason: `Auto-detected short time: ${shortMinutes} minutes`,
                            });
                            if (ex) {
                                att.exceptionIds = att.exceptionIds || [];
                                att.exceptionIds.push(new Types.ObjectId((ex as any)._id));
                                att.finalisedForPayroll = false;
                                try { await this.notificationModel.create({ to: att.employeeId as any, type: 'SHORT_TIME', message: `Short time detected: ${shortMinutes} minutes` }); } catch (_) {}
                            }
                        }
                    }
                }
            } else {
                this.logger.debug(`Skipping SHORT_TIME check for attendance ${att._id} because it's a holiday`);
            }
        } catch (e) {
            this.logger.warn('SHORT_TIME detection failed during recompute', e);
        }

        // 6) overtime detection (computeOvertime handles holiday logic for overtime requests)
        try {
            await this.computeOvertime(att.toObject() as AttendanceRecord);
        } catch (e) {
            this.logger.warn('computeOvertime failed during recompute', e);
        }

        // 7) persist changes
        try {
            await att.save();
        } catch (e) {
            this.logger.error('Failed to save attendance after recompute', e);
        }
    }

    private minutesBetweenHHMM(start: string, end: string): number {
        if (!start || !end) return 0;

        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        // If the shift crosses midnight (e.g. 22:00 → 06:00)
        if (endMinutes < startMinutes) {
            return (24 * 60 - startMinutes) + endMinutes;
        }

        return endMinutes - startMinutes;
    }
    // ============================================================
    // UPDATE
    // ============================================================

    async updateAttendanceRecord(id: string, dto: UpdateAttendanceRecordDto) {
        const rec = await this.attendanceModel.findById(id);
        if (!rec) throw new NotFoundException('Record not found');

        if (dto.punches) rec.punches = dto.punches as any;
        if (dto.finalisedForPayroll !== undefined)
            rec.finalisedForPayroll = dto.finalisedForPayroll;

        await rec.save();
        await this.recompute(rec._id);

        return rec.toObject();
    }

    // ============================================================
    // GET TODAY'S RECORD
    // ============================================================

    async getTodayRecord(employeeId: string): Promise<AttendanceRecord | null> {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        // Find record with punches in today's date range
        const record = await this.attendanceModel.findOne({
            employeeId: new Types.ObjectId(employeeId),
            'punches.time': { $gte: start, $lte: end },
        });

        return record ? record.toObject() as AttendanceRecord : null;
    }

    // ============================================================
    // GET MONTHLY ATTENDANCE
    // ============================================================

    async getMonthlyAttendance(
        employeeId: string,
        month: number,
        year: number
    ): Promise<AttendanceRecord[]> {
        // month: 1–12
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        // We fetch any record that has AT LEAST ONE punch inside that month.
        const records = await this.attendanceModel.find({
            employeeId: new Types.ObjectId(employeeId),
            'punches.time': { $gte: start, $lte: end },
        });

        return records.map(r => r.toObject() as AttendanceRecord);
    }
    async getPayrollReadyAttendance(
        month: number,
        year: number
    ): Promise<any[]> {
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        // Records where:
        //  - employee has punches during the month
        //  - AND record is finalisedForPayroll = true
        const records = await this.attendanceModel.find({
            finalisedForPayroll: true,
            'punches.time': { $gte: start, $lte: end },
        });

        return records.map(rec => ({
            attendanceId: rec._id,
            employeeId: rec.employeeId,
            totalWorkMinutes: rec.totalWorkMinutes,
            exceptionIds: rec.exceptionIds,
        }));
    }
}
