// src/time-management/attendance/attendance.service.ts

import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model, Types} from 'mongoose';

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
    ShiftAssignmentStatus,
    CorrectionRequestStatus,
} from '../models/enums';
import {HolidayService} from "./HolidayService";
import {RepeatedLatenessService} from "./RepeatedLatenessService";
import {ScheduleRule, ScheduleRuleDocument} from '../models/schedule-rule.schema';
import {NotificationService} from './NotificationService';
import {SystemRole} from "../../employee/enums/employee-profile.enums";

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

        @InjectModel(ScheduleRule.name)
        private readonly scheduleRuleModel: Model<ScheduleRuleDocument>,

        @InjectModel(LatenessRule.name)
        private readonly latenessRuleModel: Model<LatenessRuleDocument>,

        @InjectModel(OvertimeRule.name)
        private readonly overtimeRuleModel: Model<OvertimeRuleDocument>,

        private readonly holidayService: HolidayService,

        private readonly repeatedLatenessService: RepeatedLatenessService,

        private readonly notificationSvc: NotificationService,
    ) {}

    // ============================================================
    // UTILITIES
    // ============================================================

    /**
     * Parse date string in format dd/mm/yyyy hh:mm
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
                parseInt(month) - 1,
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

        // If this exception references an attendance record, attach the exception id to that record
        try {
            if (params.attendanceRecordId) {
                const att = await this.attendanceModel.findById(params.attendanceRecordId);
                if (att) {
                    att.exceptionIds = att.exceptionIds || [];
                    // avoid duplicates
                    const exists = att.exceptionIds.some(id => id?.toString?.() === (ex._id as any).toString());
                    if (!exists) att.exceptionIds.push(ex._id as any);
                    att.finalisedForPayroll = false;
                    await att.save();
                }
            }
        } catch (e) {
            this.logger.warn('Failed to attach exception to attendance record', e);
        }

        return ex.toObject() as TimeException;
    }

    /**
     * Validate if punch time is within assigned shift time range
     */
    private async validatePunchAgainstShift(
        employeeId: string | Types.ObjectId,
        punchTime: Date
    ): Promise<{
        isValid: boolean;
        error?: string;
        shift?: Shift;
        assignment?: ShiftAssignment;
        isRestDay?: boolean;
        debugInfo?: any;
    }> {
        const empOid = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;

        this.logger.debug(`[DEBUG] validatePunchAgainstShift called for employee ${empOid} at ${punchTime.toISOString()}`);

        // Check holiday first with detailed logging
        let isHoliday = false;
        let holidayError = null;
        try {
            this.logger.debug(`[DEBUG] Calling holidayService.isHoliday for date: ${punchTime.toDateString()}`);
            if (typeof this.holidayService.isHoliday === 'function') {
                isHoliday = await this.holidayService.isHoliday(punchTime);
                this.logger.debug(`[DEBUG] Holiday check result: ${isHoliday}`);
            } else {
                this.logger.warn(`[DEBUG] holidayService.isHoliday is not a function`);
            }
        } catch (e) {
            holidayError = e.message || 'Unknown error';
            this.logger.error(`[DEBUG] HolidayService.isHoliday failed:`, e);
            // Continue with validation even if holiday check fails
        }

        if (isHoliday) {
            this.logger.warn(`[DEBUG] Punch blocked: Date ${punchTime.toDateString()} is marked as holiday`);
            return {
                isValid: false,
                error: `Cannot punch on a holiday (${punchTime.toDateString()}). Please contact HR if you need an exception.`,
                isRestDay: true,
                debugInfo: { holidayCheck: true, holidayError }
            };
        }

        // Get the day boundaries for the punch time
        const dayStart = new Date(punchTime);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(punchTime);
        dayEnd.setHours(23, 59, 59, 999);

        this.logger.debug(`[DEBUG] Looking for shift assignments between ${dayStart.toISOString()} and ${dayEnd.toISOString()}`);

        // Find active shift assignment for this employee
        const assignment = await this.shiftAssignmentModel.findOne({
            employeeId: empOid,
            $or: [
                {
                    startDate: { $lte: punchTime },
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: punchTime } }
                    ]
                },
                {
                    startDate: { $lte: dayEnd },
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: dayStart } }
                    ]
                }
            ],
            status: { $in: [ShiftAssignmentStatus.PENDING, ShiftAssignmentStatus.APPROVED] }
        }).lean();

        this.logger.debug(`[DEBUG] Shift assignment found: ${assignment ? 'YES' : 'NO'}`);
        if (assignment) {
            this.logger.debug(`[DEBUG] Assignment details: ${JSON.stringify({
                _id: assignment._id,
                shiftId: assignment.shiftId,
                scheduleRuleId: assignment.scheduleRuleId,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
                status: assignment.status
            })}`);
        }

        // If no assignment found, allow punch by default (business rule: only holidays block punches)
        if (!assignment) {
            this.logger.debug(`[DEBUG] No active shift assignment found for employee ${empOid} on ${dayStart.toISOString()} - allowing punch by default`);
            return {
                isValid: true,
                isRestDay: false,
                debugInfo: { noAssignment: true }
            };
        }

        // Get the shift details
        const shift = await this.shiftModel.findById(assignment.shiftId).lean();

        if (!shift) {
            this.logger.error(`[DEBUG] Shift not found for assignment ${assignment._id}, shiftId: ${assignment.shiftId}`);
            return {
                isValid: false,
                error: 'Shift details not found for your assignment.',
                assignment: assignment as any,
                debugInfo: { shiftNotFound: true }
            };
        }

        this.logger.debug(`[DEBUG] Shift details: ${JSON.stringify({
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            graceInMinutes: shift.graceInMinutes,
            graceOutMinutes: shift.graceOutMinutes,
            punchPolicy: (shift as any).punchPolicy
        })}`);

        // If assignment has a scheduleRuleId, check if the requested punch day is included
        if (assignment.scheduleRuleId) {
            try {
                const rule = await this.scheduleRuleModel.findById(assignment.scheduleRuleId).lean();
                if (rule) {
                    this.logger.debug(`[DEBUG] Schedule rule found: ${JSON.stringify({
                        name: rule.name,
                        pattern: rule.pattern,
                        active: rule.active
                    })}`);

                    if (rule.active && rule.pattern) {
                        const pattern = (rule.pattern || '').toUpperCase();
                        this.logger.debug(`[DEBUG] Checking pattern: ${pattern}`);

                        if (pattern.startsWith('WEEKLY:')) {
                            const daysPart = pattern.split(':')[1] || '';
                            this.logger.debug(`[DEBUG] Weekly pattern days part: "${daysPart}"`);

                            // More flexible parsing of days
                            const allowedDays = daysPart.split(',')
                                .map(d => d.trim().toUpperCase())
                                .filter(d => d.length > 0)
                                .map(d => {
                                    // Take first 3 letters for day matching
                                    if (d.length >= 3) return d.substring(0, 3);
                                    return d;
                                });

                            this.logger.debug(`[DEBUG] Parsed allowed days: ${JSON.stringify(allowedDays)}`);

                            // Day names for getDay() - 0=Sunday, 1=Monday, etc.
                            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            const dayIndex = punchTime.getDay();
                            const today = dayNames[dayIndex];

                            this.logger.debug(`[DEBUG] Today is ${today} (dayIndex: ${dayIndex})`);

                            if (allowedDays.length > 0 && !allowedDays.includes(today)) {
                                this.logger.warn(`[DEBUG] Day ${today} not in allowed days: ${allowedDays.join(', ')}`);
                                return {
                                    isValid: false,
                                    error: `You are not scheduled to work on ${today} according to your shift schedule (${rule.name}). Allowed days: ${allowedDays.join(', ')}. Please contact your manager to request an exception.`,
                                    isRestDay: true,
                                    debugInfo: {
                                        today,
                                        allowedDays,
                                        pattern,
                                        dayIndex
                                    }
                                };
                            }
                        } else if (pattern === 'DAILY' || pattern.startsWith('DAILY')) {
                            this.logger.debug(`[DEBUG] Daily schedule - allowed`);
                        } else {
                            this.logger.debug(`[DEBUG] Unknown schedule rule pattern '${rule.pattern}' - allowing punch by default`);
                        }
                    } else if (!rule.active) {
                        this.logger.debug(`[DEBUG] Schedule rule ${rule._id} is not active`);
                    }
                } else {
                    this.logger.debug(`[DEBUG] Schedule rule ${assignment.scheduleRuleId} not found`);
                }
            } catch (e) {
                this.logger.error('[DEBUG] ScheduleRule lookup failed during punch validation', e);
                // Allow punch if schedule rule lookup fails
            }
        } else {
            this.logger.debug(`[DEBUG] No scheduleRuleId on assignment`);
        }

        // Parse shift times (format: "HH:mm")
        const [shiftStartHour, shiftStartMin] = shift.startTime.split(':').map(Number);
        const [shiftEndHour, shiftEndMin] = shift.endTime.split(':').map(Number);

        // Create shift time boundaries for the punch date
        const shiftStart = new Date(punchTime);
        shiftStart.setHours(shiftStartHour, shiftStartMin, 0, 0);

        const shiftEnd = new Date(punchTime);
        shiftEnd.setHours(shiftEndHour, shiftEndMin, 0, 0);

        // Handle overnight shifts (e.g., 22:00 - 06:00)
        if (shiftEndHour < shiftStartHour || (shiftEndHour === shiftStartHour && shiftEndMin < shiftStartMin)) {
            // Shift ends next day
            shiftEnd.setDate(shiftEnd.getDate() + 1);
        }

        // Apply grace periods
        const graceInMs = (shift.graceInMinutes || 0) * 60 * 1000;
        const graceOutMs = (shift.graceOutMinutes || 0) * 60 * 1000;

        const effectiveStart = new Date(shiftStart.getTime() - graceInMs);
        const effectiveEnd = new Date(shiftEnd.getTime() + graceOutMs);

        // Validate punch time is within shift range (with grace periods)
        if (punchTime < effectiveStart || punchTime > effectiveEnd) {
            const formatTime = (date: Date) => {
                const h = String(date.getHours()).padStart(2, '0');
                const m = String(date.getMinutes()).padStart(2, '0');
                return `${h}:${m}`;
            };

            this.logger.debug(`[DEBUG] Punch time outside shift range`);
            this.logger.debug(`[DEBUG] Punch time: ${formatTime(punchTime)}`);
            this.logger.debug(`[DEBUG] Effective range: ${formatTime(effectiveStart)} - ${formatTime(effectiveEnd)}`);
            this.logger.debug(`[DEBUG] Shift times: ${shift.startTime} - ${shift.endTime}`);
            this.logger.debug(`[DEBUG] Grace in: ${shift.graceInMinutes}min, Grace out: ${shift.graceOutMinutes}min`);

            return {
                isValid: false,
                error: `Punch time ${formatTime(punchTime)} is outside your assigned shift hours (${shift.startTime} - ${shift.endTime}${graceInMs > 0 || graceOutMs > 0 ? ' with grace periods' : ''}). Valid range: ${formatTime(effectiveStart)} - ${formatTime(effectiveEnd)}.`,
                shift: shift as any,
                assignment: assignment as any,
                isRestDay: false,
                debugInfo: {
                    punchTime: formatTime(punchTime),
                    effectiveStart: formatTime(effectiveStart),
                    effectiveEnd: formatTime(effectiveEnd),
                    shiftStart: shift.startTime,
                    shiftEnd: shift.endTime,
                    graceInMinutes: shift.graceInMinutes,
                    graceOutMinutes: shift.graceOutMinutes
                }
            };
        }

        this.logger.debug(`[DEBUG] Punch validated successfully for shift ${shift.name}`);
        return {
            isValid: true,
            shift: shift as any,
            assignment: assignment as any,
            isRestDay: false,
            debugInfo: {
                shiftName: shift.name,
                validationPassed: true
            }
        };
    }

    private async findOrCreateRecord(employeeId: string, date: Date) {
        // canonical day-range for the provided date
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

        // 3) Try to find an empty record created on this day
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

    async punchIn(dto: PunchInDto) {
        if (!dto.employeeId) throw new BadRequestException('employeeId required');

        this.logger.log(`[PUNCH-IN START] Employee: ${dto.employeeId}`);

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

        this.logger.debug(`[PUNCH-IN] Punch time: ${now.toISOString()} (${now.toString()})`);

        // 1.5) VALIDATE PUNCH AGAINST SHIFT TIME RANGE
        const validation = await this.validatePunchAgainstShift(dto.employeeId, now);
        if (!validation.isValid) {
            this.logger.error(`[PUNCH-IN DENIED] for employee ${dto.employeeId}: ${validation.error}`);
            this.logger.debug(`[PUNCH-IN DEBUG] Validation details: ${JSON.stringify(validation.debugInfo)}`);
            throw new BadRequestException(validation.error);
        }

        this.logger.debug(`[PUNCH-IN VALIDATED] for employee ${dto.employeeId} at ${now.toISOString()} - Shift: ${validation.shift?.name}`);

        // 2) find or create the attendance record for this employee/day
        const rec = await this.findOrCreateRecord(dto.employeeId, now);
        if (!rec) {
            throw new NotFoundException('Unable to create or find attendance record');
        }

        // 3) load authoritative doc
        const attendance = await this.attendanceModel.findById(rec._id);
        if (!attendance) {
            throw new NotFoundException('Attendance record not found after creation');
        }

        this.logger.debug(`[PUNCH-IN] Using attendance record ${attendance._id} for employee ${String(attendance.employeeId)}`);

        // 4) Validate that the punch time is on the same calendar day as existing punches
        if (attendance.punches && attendance.punches.length > 0) {
            const firstPunchDate = new Date(attendance.punches[0].time);
            const firstPunchDayStart = new Date(firstPunchDate);
            firstPunchDayStart.setHours(0, 0, 0, 0);
            const firstPunchDayEnd = new Date(firstPunchDate);
            firstPunchDayEnd.setHours(23, 59, 59, 999);

            if (now < firstPunchDayStart || now > firstPunchDayEnd) {
                this.logger.error(`[PUNCH-IN ERROR] Attempted to add punch on different day! Record ${attendance._id} has punches from ${firstPunchDate.toISOString()}, but trying to add punch at ${now.toISOString()}`);
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

        // 7.5) NATURAL SEQUENCE VALIDATION
        if (lastPunch && lastPunch.type === PunchType.IN) {
            throw new BadRequestException('Cannot punch IN again. You must punch OUT first before punching IN again.');
        }

        // 8) Determine punch policy
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
                if (shift && (shift as any).punchPolicy) {
                    punchPolicy = (shift as any).punchPolicy;
                    this.logger.debug(`[PUNCH-IN] Found punch policy: ${punchPolicy}`);
                }
            }
        } catch (e) {
            this.logger.debug('Failed to determine punch policy for punchIn; defaulting to FIRST_LAST', e);
        }
        if (!punchPolicy) punchPolicy = 'FIRST_LAST';

        // 9) Enforce policy rules for IN based on punch policy
        let shouldRecordPunch = true;

        if (punchPolicy === 'FIRST_LAST') {
            const inCount = punches.filter(p => p.type === PunchType.IN).length;

            if (inCount >= 1) {
                // FIRST_LAST: Accept punch but don't record it (acknowledge only)
                shouldRecordPunch = false;
                this.logger.log(`[PUNCH-IN POLICY] FIRST_LAST policy: Punch IN acknowledged but not recorded for employee ${dto.employeeId} - first IN already exists`);

                // Return success response without recording
                const currentRecord = await this.attendanceModel.findById(attendance._id);
                return currentRecord!.toObject();
            }

            this.logger.debug(`[PUNCH-IN POLICY] FIRST_LAST policy: Recording first punch IN for employee ${dto.employeeId}`);
        } else if (punchPolicy === 'MULTIPLE') {
            this.logger.debug(`[PUNCH-IN POLICY] MULTIPLE policy: Accepting punch IN for employee ${dto.employeeId}`);
        }

        // 10) Append IN punch only if should record
        if (shouldRecordPunch) {
            await this.attendanceModel.updateOne(
                { _id: attendance._id },
                { $push: { punches: { type: PunchType.IN, time: new Date(now) } } },
            );

            this.logger.log(`[PUNCH-IN SUCCESS] Punch IN recorded: Employee ${dto.employeeId}, Time: ${now.toISOString()}, Policy: ${punchPolicy}`);

            // 11) Recompute totals / exceptions
            await this.recompute(attendance._id);
        }

        return (await this.attendanceModel.findById(attendance._id))!.toObject();
    }

    async punchOut(dto: PunchOutDto) {
        if (!dto.employeeId) throw new BadRequestException('employeeId required');

        this.logger.log(`[PUNCH-OUT START] Employee: ${dto.employeeId}`);

        // 1) canonicalize timestamp
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

        this.logger.debug(`[PUNCH-OUT] Punch time: ${now.toISOString()} (${now.toString()})`);

        // 1.5) VALIDATE PUNCH AGAINST SHIFT TIME RANGE
        const validation = await this.validatePunchAgainstShift(dto.employeeId, now);
        if (!validation.isValid) {
            this.logger.error(`[PUNCH-OUT DENIED] for employee ${dto.employeeId}: ${validation.error}`);
            this.logger.debug(`[PUNCH-OUT DEBUG] Validation details: ${JSON.stringify(validation.debugInfo)}`);
            throw new BadRequestException(validation.error);
        }

        this.logger.debug(`[PUNCH-OUT VALIDATED] for employee ${dto.employeeId} at ${now.toISOString()} - Shift: ${validation.shift?.name}`);

        // 2) find or create the attendance record
        const rec = await this.findOrCreateRecord(dto.employeeId, now);
        if (!rec) {
            throw new NotFoundException('Unable to create or find attendance record');
        }

        // 3) load authoritative doc
        const attendance = await this.attendanceModel.findById(rec._id);
        if (!attendance) throw new NotFoundException('Attendance record not found');

        this.logger.debug(`[PUNCH-OUT] Using attendance record ${attendance._id} for employee ${String(attendance.employeeId)}`);

        // 4) Validate punch is on same calendar day
        if (attendance.punches && attendance.punches.length > 0) {
            const firstPunchDate = new Date(attendance.punches[0].time);
            const firstPunchDayStart = new Date(firstPunchDate);
            firstPunchDayStart.setHours(0, 0, 0, 0);
            const firstPunchDayEnd = new Date(firstPunchDate);
            firstPunchDayEnd.setHours(23, 59, 59, 999);

            if (now < firstPunchDayStart || now > firstPunchDayEnd) {
                this.logger.error(`[PUNCH-OUT ERROR] Attempted to add punch on different day! Record ${attendance._id} has punches from ${firstPunchDate.toISOString()}, but trying to add punch at ${now.toISOString()}`);
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

        // 8) Determine punch policy
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
                if (shift && (shift as any).punchPolicy) {
                    punchPolicy = (shift as any).punchPolicy;
                    this.logger.debug(`[PUNCH-OUT] Found punch policy: ${punchPolicy}`);
                }
            }
        } catch (e) {
            this.logger.debug('Failed to determine punch policy for punchOut; defaulting to FIRST_LAST', e);
        }
        if (!punchPolicy) punchPolicy = 'FIRST_LAST';

        // 7.5) NATURAL SEQUENCE VALIDATION
        if (punchPolicy === 'MULTIPLE') {
            if (!lastPunch) {
                throw new BadRequestException('Cannot punch OUT. You must punch IN first.');
            }
            if (lastPunch.type === PunchType.OUT) {
                throw new BadRequestException('Cannot punch OUT again. You must punch IN first before punching OUT again.');
            }
        } else {
            if (!lastPunch || !punches.some(p => p.type === PunchType.IN)) {
                throw new BadRequestException('Cannot punch OUT. You must punch IN first.');
            }
        }

        // 9) Enforce policy rules for OUT based on punch policy
        if (punchPolicy === 'FIRST_LAST') {
            const existingOutPunches = punches.filter(p => p.type === PunchType.OUT);

            if (existingOutPunches.length >= 1) {
                const lastOutTime = new Date(existingOutPunches[existingOutPunches.length - 1].time);

                // Only replace if new OUT time is later than existing OUT
                if (now.getTime() > lastOutTime.getTime()) {
                    this.logger.debug(`[PUNCH-OUT POLICY] FIRST_LAST policy: New OUT time ${now.toISOString()} is later than existing ${lastOutTime.toISOString()}, replacing`);

                    // Remove all existing OUT punches
                    await this.attendanceModel.updateOne(
                        { _id: attendance._id },
                        { $pull: { punches: { type: PunchType.OUT } } }
                    );
                } else {
                    // New OUT is earlier or same time, acknowledge but don't record
                    this.logger.log(`[PUNCH-OUT POLICY] FIRST_LAST policy: Punch OUT acknowledged but not recorded for employee ${dto.employeeId} - existing OUT ${lastOutTime.toISOString()} is later than or equal to new OUT ${now.toISOString()}`);

                    // Return success response without recording
                    const currentRecord = await this.attendanceModel.findById(attendance._id);
                    return currentRecord!.toObject();
                }
            } else {
                this.logger.debug(`[PUNCH-OUT POLICY] FIRST_LAST policy: Recording first punch OUT for employee ${dto.employeeId}`);
            }
        } else if (punchPolicy === 'MULTIPLE') {
            this.logger.debug(`[PUNCH-OUT POLICY] MULTIPLE policy: Accepting punch OUT for employee ${dto.employeeId}`);
        }

        // 10) Append OUT punch
        await this.attendanceModel.updateOne(
            { _id: attendance._id },
            { $push: { punches: { type: PunchType.OUT, time: new Date(now) } } },
        );

        this.logger.log(`[PUNCH-OUT SUCCESS] Punch OUT recorded: Employee ${dto.employeeId}, Time: ${now.toISOString()}, Policy: ${punchPolicy}`);

        // 11) Recompute totals and side effects
        await this.recompute(attendance._id);

        // CLEANUP: after recompute, if SHORT_TIME no longer applies, remove SHORT_TIME exceptions and related notifications
        try {
            const updatedAtt = await this.attendanceModel.findById(attendance._id);
            if (updatedAtt) {
                const recDate = this.getRecordDate(updatedAtt.toObject() as AttendanceRecord);
                const isHoliday = await this.holidayService.isHoliday(recDate).catch(() => false);
                const isWeeklyRest = await this.isWeeklyRest(updatedAtt.employeeId as any, recDate).catch(() => false);

                if (!isHoliday && !isWeeklyRest) {
                    const scheduledMinutes = await this.scheduledMinutesForRecord(updatedAtt.toObject() as AttendanceRecord);
                    const shortMinutes = Math.max(0, scheduledMinutes - (updatedAtt.totalWorkMinutes || 0));

                    if (shortMinutes <= 0) {
                        try {
                            const existing = await this.exceptionModel.find({ attendanceRecordId: updatedAtt._id, type: TimeExceptionType.SHORT_TIME });
                            if (existing && existing.length) {
                                const idsToRemove = existing.map(e => e._id);
                                await this.exceptionModel.deleteMany({ _id: { $in: idsToRemove } });

                                // Remove references from attendance.exceptionIds
                                updatedAtt.exceptionIds = (updatedAtt.exceptionIds || []).filter(id => !idsToRemove.some(d => String(d) === String(id)));

                                // Remove related SHORT_TIME notification logs for that employee on the same day (best-effort)
                                try {
                                    const dayStart = new Date(recDate); dayStart.setHours(0,0,0,0);
                                    const dayEnd = new Date(recDate); dayEnd.setHours(23,59,59,999);
                                    await this.notificationModel.deleteMany({ to: updatedAtt.employeeId as any, type: 'SHORT_TIME', createdAt: { $gte: dayStart, $lte: dayEnd } as any });
                                } catch (e) {
                                    this.logger.warn('Failed to delete SHORT_TIME notification logs', e);
                                }

                                // If there are no other open exceptions, mark finalisedForPayroll = true
                                const otherOpen = await this.exceptionModel.findOne({ attendanceRecordId: updatedAtt._id, status: { $ne: TimeExceptionStatus.RESOLVED } });
                                if (!otherOpen) updatedAtt.finalisedForPayroll = true;

                                try {
                                    await updatedAtt.save();
                                } catch (e) {
                                    this.logger.warn('Failed to save attendance after removing SHORT_TIME exceptions', e);
                                }
                            }
                        } catch (e) {
                            this.logger.warn('Failed to remove SHORT_TIME exceptions after recompute', e);
                        }
                    }
                }
            }
        } catch (e) {
            this.logger.warn('SHORT_TIME cleanup after punchOut failed', e);
        }

        // 12) After punch out: resolve any open MISSED_PUNCH exceptions for this attendance record
        try {
            const openMissed = await this.exceptionModel.find({ attendanceRecordId: attendance._id, type: TimeExceptionType.MISSED_PUNCH });
            if (openMissed && openMissed.length) {
                const idsToRemove = openMissed.map(m => m._id);
                try {
                    await this.exceptionModel.deleteMany({ _id: { $in: idsToRemove } });
                } catch (e) {
                    this.logger.warn('Failed to delete missed punch exceptions', e);
                }

                try {
                    attendance.exceptionIds = (attendance.exceptionIds || []).filter(id => !idsToRemove.some(rid => String(rid) === String(id)));
                    await attendance.save();
                } catch (e) {
                    this.logger.warn('Failed to remove deleted missed-punch ids from attendance', e);
                }
            }
        } catch (e) {
            this.logger.warn('Failed to lookup/resolve open MISSED_PUNCH exceptions on punchOut', e);
        }

        return (await this.attendanceModel.findById(attendance._id))!.toObject();
    }

    // ============================================================
    // CALCULATION LOGIC
    // ============================================================
    computeTotalMinutes(rec: AttendanceRecord): number {
        const punches = rec.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));

        if (!punches?.length) return 0;

        let total = 0;
        let i = 0;

        while (i < punches.length) {
            if (punches[i].type === PunchType.IN) {
                let nextOutFound = false;

                for (let j = i + 1; j < punches.length; j++) {
                    if (punches[j].type === PunchType.OUT) {
                        total += new Date(punches[j].time).getTime()
                            - new Date(punches[i].time).getTime();

                        i = j + 1;
                        nextOutFound = true;
                        break;
                    }
                }

                if (!nextOutFound) {
                    i++;
                }
            } else {
                i++;
            }
        }

        return Math.round(total / 60000);
    }

    private async isWeeklyRest(employeeId: string | Types.ObjectId, date: Date): Promise<boolean> {
        try {
            const start = new Date(date); start.setHours(0,0,0,0);
            const end = new Date(date); end.setHours(23,59,59,999);
            const empOid = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;

            const assignment = await this.shiftAssignmentModel.findOne({
                employeeId: empOid,
                status: { $in: [ShiftAssignmentStatus.PENDING, ShiftAssignmentStatus.APPROVED] },
                startDate: { $lte: end },
                $or: [{ endDate: { $exists: false } }, { endDate: { $gte: start } }],
            }).lean();

            if (!assignment) return false;
            if (!assignment.scheduleRuleId) return false;

            const rule = await this.scheduleRuleModel.findById(assignment.scheduleRuleId).lean();
            if (!rule || !rule.active || !rule.pattern) return false;

            const pattern = (rule.pattern || '').toUpperCase();
            if (pattern.startsWith('WEEKLY:')) {
                const daysPart = pattern.split(':')[1] || '';
                const allowedDays = daysPart.split(',')
                    .map(d => d.trim().toUpperCase())
                    .filter(d => d.length > 0)
                    .map(d => d.length >= 3 ? d.substring(0, 3) : d);

                const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
                const today = dayNames[date.getDay()];

                return !allowedDays.includes(today);
            }

            return false;
        } catch (e) {
            this.logger.warn('isWeeklyRest check failed', e);
            return false;
        }
    }

    async computeLateness(record: AttendanceRecord) {
        const punches = record.punches
            ?.slice()
            .sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const firstIn = punches?.find((p) => p.type === PunchType.IN);
        if (!firstIn) return 0;

        const recDate = new Date(firstIn.time);

        // Holiday suppression
        try {
            if (await this.holidayService.isHoliday(recDate)) {
                this.logger.debug(`[COMPUTE LATENESS] Date ${recDate.toDateString()} is holiday - no lateness`);
                return 0;
            }
        } catch (e) {
            this.logger.warn('HolidayService.isHoliday failed in computeLateness', e);
        }

        // Weekly rest suppression
        try {
            if (await this.isWeeklyRest(record.employeeId as any, recDate)) {
                this.logger.debug(`[COMPUTE LATENESS] Date ${recDate.toDateString()} is weekly rest - no lateness`);
                return 0;
            }
        } catch (e) {
            this.logger.warn('isWeeklyRest failed in computeLateness', e);
        }

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

        // Holiday suppression
        try {
            if (await this.holidayService.isHoliday(recDate)) {
                this.logger.debug(`[COMPUTE EARLY LEAVE] Date ${recDate.toDateString()} is holiday - no early leave`);
                return 0;
            }
        } catch (e) {
            this.logger.warn('HolidayService.isHoliday failed in computeEarlyLeave', e);
        }

        // Weekly rest suppression
        try {
            if (await this.isWeeklyRest(record.employeeId as any, recDate)) {
                this.logger.debug(`[COMPUTE EARLY LEAVE] Date ${recDate.toDateString()} is weekly rest - no early leave`);
                return 0;
            }
        } catch (e) {
            this.logger.warn('isWeeklyRest failed in computeEarlyLeave', e);
        }

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

        // Check if it's a holiday
        let isHoliday = false;
        try {
            isHoliday = await this.holidayService.isHoliday(recDate);
        } catch (e) {
            this.logger.warn('HolidayService.isHoliday failed in computeOvertime', e);
        }

        if (shift.requiresApprovalForOvertime) {
            const rule = await this.overtimeRuleModel.findOne({ active: true });
            if (!rule || !rule.approved) {
                await this.createTimeExceptionAuto({
                    employeeId: record.employeeId,
                    attendanceRecordId: (record as any)._id,
                    type: TimeExceptionType.OVERTIME_REQUEST,
                    reason: isHoliday ? 'Holiday overtime - requires approval' : 'Overtime requires approval',
                });
            }
        }

        return minutes;
    }

    // ============================================================
    // RECOMPUTE
    // ============================================================

    private async recompute(attendanceId: Types.ObjectId | string) {
        const att = await this.attendanceModel.findById(attendanceId);
        if (!att) return;

        this.logger.debug(`[RECOMPUTE] Starting recompute for attendance ${attendanceId}`);

        // 1) compute total minutes from punches
        const total = this.computeTotalMinutes(att.toObject() as AttendanceRecord);
        att.totalWorkMinutes = total;
        this.logger.debug(`[RECOMPUTE] Total work minutes: ${total}`);

        // 2) detect unmatched punches -> potentially MISSED_PUNCH
        const punches = (att.punches || []).slice().sort((a, b) => +new Date(a.time) - +new Date(b.time));
        const inCount = punches.filter(p => p.type === PunchType.IN).length;
        const outCount = punches.filter(p => p.type === PunchType.OUT).length;

        // Determine record date from punches
        const recDate = this.getRecordDate(att.toObject() as AttendanceRecord);
        let isHoliday = false;
        let isWeeklyRest = false;

        try {
            isHoliday = await this.holidayService.isHoliday(recDate);
        } catch (err) {
            this.logger.warn('holidayService.isHoliday failed during recompute', err);
        }

        try {
            isWeeklyRest = await this.isWeeklyRest(att.employeeId as any, recDate);
        } catch (err) {
            this.logger.warn('isWeeklyRest failed during recompute', err);
        }

        this.logger.debug(`[RECOMPUTE] Date: ${recDate.toDateString()}, isHoliday: ${isHoliday}, isWeeklyRest: ${isWeeklyRest}`);

        if (inCount > outCount) {
            att.hasMissedPunch = true;
            att.finalisedForPayroll = false;

            // only auto-create MISSED_PUNCH exception if NOT a holiday or weekly rest
            if (!isHoliday && !isWeeklyRest) {
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

                        // Send notifications
                        try {
                            await this.notificationModel.create({
                                to: att.employeeId as any,
                                type: 'MISSED_PUNCH',
                                message: `A missed punch was detected for attendance ${att._id}. Please complete your punches or request an exception.`
                            });
                        } catch (e) { this.logger.warn('Failed to notify employee of missed punch', e); }

                        // ... other notification logic
                    }
                } catch (e) {
                    this.logger.warn('Failed to create MISSED_PUNCH exception', e);
                }
            } else {
                this.logger.debug(`[RECOMPUTE] Missed punch on holiday/weekly rest for attendance ${att._id} - skipping MISSED_PUNCH exception`);
            }
        } else {
            att.hasMissedPunch = false;
        }

        // 3) lateness detection
        try {
            const lateMinutes = await this.computeLateness(att.toObject() as AttendanceRecord);
            if (lateMinutes > 0) {
                this.logger.debug(`[RECOMPUTE] Lateness detected: ${lateMinutes} minutes`);
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

                    // Repeated lateness evaluation
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

        // 4) early leave detection
        try {
            const earlyMinutes = await this.computeEarlyLeave(att.toObject() as AttendanceRecord);
            if (earlyMinutes > 0) {
                this.logger.debug(`[RECOMPUTE] Early leave detected: ${earlyMinutes} minutes`);
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
                }
            }
        } catch (e) {
            this.logger.warn('computeEarlyLeave/recompute EARLY_LEAVE handling failed', e);
        }

        // 5) short time detection (skip on holiday/weekly rest)
        try {
            if (!isHoliday && !isWeeklyRest) {
                const scheduledMinutes = await this.scheduledMinutesForRecord(att.toObject() as AttendanceRecord);
                const shortMinutes = Math.max(0, scheduledMinutes - att.totalWorkMinutes);

                if (shortMinutes > 0) {
                    // still short -> ensure an exception exists
                    const existing = await this.exceptionModel.findOne({ attendanceRecordId: att._id, type: TimeExceptionType.SHORT_TIME });
                    if (!existing) {
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
                        }
                    }
                } else {
                    // Not short anymore: delete any existing SHORT_TIME exceptions
                    try {
                        const existing = await this.exceptionModel.find({ attendanceRecordId: att._id, type: TimeExceptionType.SHORT_TIME });
                        if (existing && existing.length) {
                            const idsToDelete = existing.map(e => e._id);
                            await this.exceptionModel.deleteMany({ _id: { $in: idsToDelete } });
                            att.exceptionIds = (att.exceptionIds || []).filter(id => !idsToDelete.some(d => String(d) === String(id)));

                            const otherOpen = await this.exceptionModel.findOne({ attendanceRecordId: att._id, status: { $ne: TimeExceptionStatus.RESOLVED } });
                            if (!otherOpen) att.finalisedForPayroll = true;
                        }
                    } catch (e) {
                        this.logger.warn('Failed to remove SHORT_TIME exceptions when resolved', e);
                    }
                }
            }
        } catch (e) {
            this.logger.warn('SHORT_TIME detection failed during recompute', e);
        }

        // 6) overtime detection
        try {
            const overtimeMinutes = await this.computeOvertime(att);
            if (overtimeMinutes > 0) {
                this.logger.debug(`[RECOMPUTE] Overtime detected: ${overtimeMinutes} minutes`);
                const ex = await this.createTimeExceptionAuto({
                    employeeId: att.employeeId,
                    attendanceRecordId: att._id,
                    type: TimeExceptionType.OVERTIME_REQUEST,
                    reason: `Auto-detected overtime: ${overtimeMinutes} minutes`,
                });
                if (ex) {
                    att.exceptionIds = att.exceptionIds || [];
                    att.exceptionIds.push(new Types.ObjectId((ex as any)._id));
                    att.finalisedForPayroll = false;
                }
            }
        } catch (e) {
            this.logger.warn('computeOvertime/recompute OVERTIME handling failed', e);
        }

        // --- FINALISATION RULE ---
        try {
            const unresolved = await this.correctionModel.findOne({
                attendanceRecord: att._id,
                status: { $in: [CorrectionRequestStatus.SUBMITTED, CorrectionRequestStatus.IN_REVIEW, CorrectionRequestStatus.ESCALATED] },
            }).lean();

            if ((inCount >= 1 && outCount >= 1) && !unresolved) {
                att.finalisedForPayroll = true;
                this.logger.debug(`[RECOMPUTE] Record finalized for payroll`);
            } else if (unresolved) {
                att.finalisedForPayroll = false;
                this.logger.debug(`[RECOMPUTE] Record not finalized due to unresolved correction request`);
            }
        } catch (e) {
            this.logger.warn('Failed to check unresolved correction requests during recompute', e);
        }

        // 7) persist changes
        try {
            await att.save();
            this.logger.debug(`[RECOMPUTE] Saved attendance record ${att._id}`);
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

        // If the shift crosses midnight
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
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

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

    // ============================================================
    // ATTENDANCE REVIEW & CORRECTION
    // ============================================================

    /**
     * Review a single attendance record for issues
     */
    async reviewAttendanceRecord(attendanceRecordId: string): Promise<{
        record: AttendanceRecord;
        issues: Array<{
            type: 'MISSING_PUNCH' | 'INVALID_SEQUENCE' | 'SHORT_TIME' | 'NO_PUNCH_OUT' | 'NO_PUNCH_IN' | 'HOLIDAY_PUNCH';
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            description: string;
            suggestion?: string;
        }>;
        canFinalize: boolean;
    }> {
        const record = await this.attendanceModel.findById(attendanceRecordId);
        if (!record) {
            throw new NotFoundException('Attendance record not found');
        }

        const issues: any[] = [];
        const punches = (record.punches || []).slice().sort((a, b) => +new Date(a.time) - +new Date(b.time));

        // 1. Check if record has punches
        if (!punches || punches.length === 0) {
            issues.push({
                type: 'MISSING_PUNCH',
                severity: 'HIGH',
                description: 'No punches recorded for this day',
                suggestion: 'Add punch in and punch out times'
            });
            return {
                record: record.toObject() as AttendanceRecord,
                issues,
                canFinalize: false
            };
        }

        // 2. Check for missing punch out (last punch is IN)
        const lastPunch = punches[punches.length - 1];
        if (lastPunch.type === PunchType.IN) {
            issues.push({
                type: 'NO_PUNCH_OUT',
                severity: 'HIGH',
                description: 'Missing punch OUT - last punch is IN',
                suggestion: 'Add punch out time'
            });
        }

        // 3. Check for missing punch in (first punch is OUT)
        const firstPunch = punches[0];
        if (firstPunch.type === PunchType.OUT) {
            issues.push({
                type: 'NO_PUNCH_IN',
                severity: 'HIGH',
                description: 'Missing punch IN - first punch is OUT',
                suggestion: 'Add punch in time before first OUT'
            });
        }

        // 4. Check for invalid sequence (consecutive IN or OUT)
        for (let i = 0; i < punches.length - 1; i++) {
            const current = punches[i];
            const next = punches[i + 1];

            if (current.type === next.type) {
                issues.push({
                    type: 'INVALID_SEQUENCE',
                    severity: 'HIGH',
                    description: `Invalid punch sequence: Two consecutive ${current.type} punches at positions ${i} and ${i + 1}`,
                    suggestion: `Remove duplicate or add missing ${current.type === PunchType.IN ? 'OUT' : 'IN'} punch`
                });
            }
        }

        // 5. Check if already marked as has missed punch
        if (record.hasMissedPunch) {
            issues.push({
                type: 'MISSING_PUNCH',
                severity: 'MEDIUM',
                description: 'Record flagged as having missed punch',
                suggestion: 'Review and correct punch sequence'
            });
        }

        // 6. Check for holiday punch
        try {
            const recordDate = this.getRecordDate(record.toObject() as AttendanceRecord);
            const isHoliday = await this.holidayService.isHoliday(recordDate);
            if (isHoliday && punches.length > 0) {
                issues.push({
                    type: 'HOLIDAY_PUNCH',
                    severity: 'LOW',
                    description: 'Punch recorded on a holiday',
                    suggestion: 'Verify if employee was scheduled to work on holiday'
                });
            }
        } catch (e) {
            this.logger.debug('Failed to check holiday status during review', e);
        }

        // 7. Check for short time
        if (record.totalWorkMinutes > 0) {
            try {
                const scheduledMinutes = await this.scheduledMinutesForRecord(record.toObject() as AttendanceRecord);
                const shortMinutes = Math.max(0, scheduledMinutes - record.totalWorkMinutes);
                if (shortMinutes > 30) {
                    issues.push({
                        type: 'SHORT_TIME',
                        severity: 'MEDIUM',
                        description: `Short time detected: ${shortMinutes} minutes less than scheduled ${scheduledMinutes} minutes`,
                        suggestion: 'Verify punch times are correct or create time exception'
                    });
                }
            } catch (e) {
                this.logger.debug('Failed to check short time during review', e);
            }
        }

        // Determine if can finalize
        const hasHighSeverityIssues = issues.some(i => i.severity === 'HIGH');
        const canFinalize = !hasHighSeverityIssues;

        return {
            record: record.toObject() as AttendanceRecord,
            issues,
            canFinalize
        };
    }

    /**
     * Correct attendance record by adding/removing/modifying punches
     */
    async correctAttendanceRecord(params: {
        attendanceRecordId: string;
        correctedPunches?: Array<{ type: PunchType; time: Date | string }>;
        addPunchIn?: string | Date;
        addPunchOut?: string | Date;
        removePunchIndex?: number;
        correctionReason: string;
        correctedBy?: string;
    }): Promise<{
        record: AttendanceRecord;
        correctionApplied: string;
        previousState: any;
    }> {
        const record = await this.attendanceModel.findById(params.attendanceRecordId);
        if (!record) {
            throw new NotFoundException('Attendance record not found');
        }

        // Save previous state for audit trail
        const previousState = {
            punches: record.punches ? JSON.parse(JSON.stringify(record.punches)) : [],
            totalWorkMinutes: record.totalWorkMinutes,
            hasMissedPunch: record.hasMissedPunch
        };

        let correctionApplied = '';

        // Handle full punch replacement
        if (params.correctedPunches && params.correctedPunches.length > 0) {
            const parsedPunches = params.correctedPunches.map(p => ({
                type: p.type,
                time: typeof p.time === 'string' ? this.parseCustomDateFormat(p.time) || new Date(p.time) : p.time
            }));

            record.punches = parsedPunches as any;
            correctionApplied = 'Replaced all punches with corrected sequence';
        } else {
            // Handle individual operations
            const punches = record.punches || [];

            // Add punch IN
            if (params.addPunchIn) {
                const punchTime = typeof params.addPunchIn === 'string'
                    ? this.parseCustomDateFormat(params.addPunchIn) || new Date(params.addPunchIn)
                    : params.addPunchIn;

                punches.push({ type: PunchType.IN, time: punchTime } as any);
                correctionApplied += 'Added missing punch IN. ';
            }

            // Add punch OUT
            if (params.addPunchOut) {
                const punchTime = typeof params.addPunchOut === 'string'
                    ? this.parseCustomDateFormat(params.addPunchOut) || new Date(params.addPunchOut)
                    : params.addPunchOut;

                punches.push({ type: PunchType.OUT, time: punchTime } as any);
                correctionApplied += 'Added missing punch OUT. ';
            }

            // Remove punch by index
            if (params.removePunchIndex !== undefined && params.removePunchIndex >= 0) {
                if (params.removePunchIndex < punches.length) {
                    const removed = punches.splice(params.removePunchIndex, 1);
                    correctionApplied += `Removed punch at index ${params.removePunchIndex} (${removed[0].type} at ${removed[0].time}). `;
                }
            }

            // Sort punches by time
            record.punches = punches.sort((a, b) => +new Date(a.time) - +new Date(b.time));
        }

        // Clear missed punch flag if correction applied
        if (correctionApplied) {
            record.hasMissedPunch = false;
        }

        // Save correction metadata as a notification/log
        try {
            await this.notificationModel.create({
                to: record.employeeId as any,
                type: 'ATTENDANCE_CORRECTED',
                message: `Attendance corrected: ${correctionApplied}. Reason: ${params.correctionReason}. ${params.correctedBy ? `Corrected by: ${params.correctedBy}` : ''}`,
            });
        } catch (e) {
            this.logger.warn('Failed to create correction notification', e);
        }

        // Recompute totals
        await record.save();
        await this.recompute(record._id);

        // Reload record
        const updatedRecord = await this.attendanceModel.findById(record._id);

        return {
            record: updatedRecord!.toObject() as AttendanceRecord,
            correctionApplied,
            previousState
        };
    }

    /**
     * Bulk review attendance for a period
     */
    async bulkReviewAttendance(params: {
        employeeId: string;
        startDate: string | Date;
        endDate: string | Date;
        filterByIssue?: string;
    }): Promise<Array<{
        recordId: string;
        date: Date;
        issues: any[];
        canFinalize: boolean;
    }>> {
        const start = typeof params.startDate === 'string' ? new Date(params.startDate) : params.startDate;
        const end = typeof params.endDate === 'string' ? new Date(params.endDate) : params.endDate;

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const records = await this.attendanceModel.find({
            employeeId: new Types.ObjectId(params.employeeId),
            'punches.time': { $gte: start, $lte: end },
        });

        const results: Array<{
            recordId: string;
            date: Date;
            issues: any[];
            canFinalize: boolean;
        }> = [];

        for (const record of records) {
            const review = await this.reviewAttendanceRecord(record._id.toString());

            // Filter by issue type if specified
            if (params.filterByIssue && params.filterByIssue !== 'ALL') {
                const hasMatchingIssue = review.issues.some(i => i.type === params.filterByIssue);
                if (!hasMatchingIssue) continue;
            }

            // Only include records with issues
            if (review.issues.length > 0) {
                results.push({
                    recordId: record._id.toString(),
                    date: this.getRecordDate(record.toObject() as AttendanceRecord),
                    issues: review.issues,
                    canFinalize: review.canFinalize
                });
            }
        }

        return results;
    }

    private async scheduledMinutesForRecord(att: AttendanceRecord): Promise<number> {
        try {
            const recDate = this.getRecordDate(att);
            const dayStart = new Date(recDate); dayStart.setHours(0,0,0,0);
            const dayEnd = new Date(recDate); dayEnd.setHours(23,59,59,999);

            const assignment = await this.shiftAssignmentModel.findOne({
                employeeId: new Types.ObjectId(att.employeeId as any),
                status: { $in: [ShiftAssignmentStatus.PENDING, ShiftAssignmentStatus.APPROVED] },
                startDate: { $lte: dayEnd },
                $or: [{ endDate: { $exists: false } }, { endDate: { $gte: dayStart } }],
            }).lean();

            if (!assignment) return 0;

            const shift = await this.shiftModel.findById(assignment.shiftId).lean();
            if (!shift) return 0;

            // Build scheduled start and end Date objects relative to recDate
            const [sh, sm] = (shift.startTime || '00:00').split(':').map(Number);
            const [eh, em] = (shift.endTime || '00:00').split(':').map(Number);

            const scheduledStart = new Date(recDate);
            scheduledStart.setHours(sh, sm, 0, 0);

            const scheduledEnd = new Date(recDate);
            scheduledEnd.setHours(eh, em, 0, 0);

            // If shift ends before it starts, it means it goes to next day
            if (scheduledEnd.getTime() <= scheduledStart.getTime()) {
                scheduledEnd.setDate(scheduledEnd.getDate() + 1);
            }

            // Compute overlap between [scheduledStart, scheduledEnd] and the attendance day window
            const overlapStart = new Date(Math.max(scheduledStart.getTime(), dayStart.getTime()));
            const overlapEnd = new Date(Math.min(scheduledEnd.getTime(), dayEnd.getTime()));

            if (overlapEnd.getTime() <= overlapStart.getTime()) return 0;

            const minutes = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / 60000);
            return minutes;
        } catch (e) {
            this.logger.warn('scheduledMinutesForRecord failed', e);
            return 0;
        }
    }

    /**
     * Diagnostic method to check why punches are being blocked
     */
    async diagnosticCheck(params: {
        employeeId: string;
        date: string | Date;
    }): Promise<any> {
        const date = typeof params.date === 'string' ? new Date(params.date) : params.date;

        const result = {
            date: date.toISOString(),
            dayOfWeek: date.getDay(),
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
            validationResult: null as any,
            holidayCheck: null as any,
            shiftAssignment: null as any,
            scheduleRule: null as any,
            shiftDetails: null as any
        };

        try {
            // Check holiday service
            if (typeof this.holidayService.isHoliday === 'function') {
                result.holidayCheck = {
                    isHoliday: await this.holidayService.isHoliday(date),
                    serviceAvailable: true
                };
            } else {
                result.holidayCheck = {
                    isHoliday: false,
                    serviceAvailable: false,
                    error: 'holidayService.isHoliday is not a function'
                };
            }
        } catch (e) {
            result.holidayCheck = {
                isHoliday: false,
                serviceAvailable: false,
                error: e.message
            };
        }

        // Get shift assignment
        const empOid = new Types.ObjectId(params.employeeId);
        const dayStart = new Date(date); dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(date); dayEnd.setHours(23,59,59,999);

        const assignment = await this.shiftAssignmentModel.findOne({
            employeeId: empOid,
            $or: [
                {
                    startDate: { $lte: date },
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: date } }
                    ]
                },
                {
                    startDate: { $lte: dayEnd },
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: dayStart } }
                    ]
                }
            ],
            status: { $in: [ShiftAssignmentStatus.PENDING, ShiftAssignmentStatus.APPROVED] }
        }).lean();

        if (assignment) {
            result.shiftAssignment = {
                _id: assignment._id,
                shiftId: assignment.shiftId,
                scheduleRuleId: assignment.scheduleRuleId,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
                status: assignment.status
            };

            // Get shift details
            const shift = await this.shiftModel.findById(assignment.shiftId).lean();
            if (shift) {
                result.shiftDetails = {
                    name: shift.name,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    graceInMinutes: shift.graceInMinutes,
                    graceOutMinutes: shift.graceOutMinutes,
                    punchPolicy: (shift as any).punchPolicy
                };
            }

            // Get schedule rule
            if (assignment.scheduleRuleId) {
                const rule = await this.scheduleRuleModel.findById(assignment.scheduleRuleId).lean();
                if (rule) {
                    result.scheduleRule = {
                        name: rule.name,
                        pattern: rule.pattern,
                        active: rule.active
                    };

                    // Parse pattern if it's weekly
                    if (rule.pattern && rule.pattern.toUpperCase().startsWith('WEEKLY:')) {
                        const daysPart = rule.pattern.split(':')[1] || '';
                        const allowedDays = daysPart.split(',')
                            .map(d => d.trim().toUpperCase())
                            .filter(d => d.length > 0)
                            .map(d => d.length >= 3 ? d.substring(0, 3) : d);

                        const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
                        const today = dayNames[date.getDay()];

                        result.scheduleRule.parsed = {
                            allowedDays,
                            today,
                            isAllowed: allowedDays.includes(today)
                        };
                    }
                }
            }
        }

        // Run validation
        result.validationResult = await this.validatePunchAgainstShift(params.employeeId, date);

        return result;
    }
}

