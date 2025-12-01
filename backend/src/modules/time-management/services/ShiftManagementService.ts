// src/time-management/shift-management/shift-management.service.ts
import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {ShiftType, ShiftTypeDocument} from "../models/shift-type.schema";
import {Shift, ShiftDocument} from "../models/shift.schema";
import {ScheduleRule, ScheduleRuleDocument} from "../models/schedule-rule.schema";
import {ShiftAssignment, ShiftAssignmentDocument} from "../models/shift-assignment.schema";
import {Holiday, HolidayDocument} from "../models/holiday.schema";
import {LatenessRule, LatenessRuleDocument} from "../models/lateness-rule.schema";
import {OvertimeRule, OvertimeRuleDocument} from "../models/overtime-rule.schema";
import {NotificationLog, NotificationLogDocument} from "../models/notification-log.schema";
import {
    AssignShiftDto, BulkAssignShiftDto, CreateHolidayDto, CreateLatenessRuleDto, CreateOvertimeRuleDto,
    CreateScheduleRuleDto,
    CreateShiftDto,
    CreateShiftTypeDto, RenewAssignmentDto, UpdateHolidayDto, UpdateLatenessRuleDto,
    UpdateOvertimeRuleDto, UpdateScheduleRuleDto,
    UpdateShiftDto,
    UpdateShiftTypeDto
} from "../dto/ShiftManagementDtos";


/**
 * ShiftManagementService
 * Responsibilities:
 *  - shift types (create/read/update/deactivate)
 *  - shifts (templates) with punch policy & grace minutes
 *  - schedule rules (patterns, rotations)
 *  - shift assignments (single & bulk + validation against overlap)
 *  - holiday calendar (national/organizational/weekend)
 *  - lateness & overtime rule CRUD
 *  - notifications (create NotificationLog entries)
 *
 * Mapped BR/FR/US: see inline comments
 */
@Injectable()
export class ShiftManagementService {
    private readonly logger = new Logger(ShiftManagementService.name);

    constructor(
        @InjectModel(ShiftType.name) private readonly shiftTypeModel: Model<ShiftTypeDocument>,
        @InjectModel(Shift.name) private readonly shiftModel: Model<ShiftDocument>,
        @InjectModel(ScheduleRule.name) private readonly scheduleRuleModel: Model<ScheduleRuleDocument>,
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
        @InjectModel(Holiday.name) private readonly holidayModel: Model<HolidayDocument>,
        @InjectModel(LatenessRule.name) private readonly latenessRuleModel: Model<LatenessRuleDocument>,
        @InjectModel(OvertimeRule.name) private readonly overtimeRuleModel: Model<OvertimeRuleDocument>,
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLogDocument>,
    ) {}

    // --------------------------
    // ShiftType
    // --------------------------
    // FR: Shift definitions (Phase 1)
    async createShiftType(dto: CreateShiftTypeDto): Promise<ShiftType> {
        const found = await this.shiftTypeModel.findOne({ name: dto.name }).lean();
        if (found) throw new ConflictException('ShiftType already exists');
        const doc = new this.shiftTypeModel({ name: dto.name, active: dto.active ?? true });
        return doc.save();
    }

    async getShiftTypes(): Promise<ShiftType[]> {
        return this.shiftTypeModel.find().lean();
    }

    async updateShiftType(id: string, dto: UpdateShiftTypeDto): Promise<ShiftType> {
        const updated = await this.shiftTypeModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('ShiftType not found');
        return updated as ShiftType;
    }

    async deactivateShiftType(id: string): Promise<void> {
        const res = await this.shiftTypeModel.findByIdAndUpdate(id, { active: false });
        if (!res) throw new NotFoundException('ShiftType not found');
    }

    // --------------------------
    // Shift (template)
    // --------------------------
    // BR: punchPolicy, grace minutes; FR: shift templates for scheduling
    async createShift(dto: CreateShiftDto): Promise<Shift> {
        // ensure shiftType exists
        const shiftType = await this.shiftTypeModel.findById(dto.shiftType);
        if (!shiftType) throw new BadRequestException('ShiftType not found');

        // basic validation for time format HH:mm
        const hhmm = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
        if (!hhmm.test(dto.startTime) || !hhmm.test(dto.endTime)) {
            throw new BadRequestException('startTime/endTime must be in HH:mm format');
        }

        const doc = new this.shiftModel({
            name: dto.name,
            shiftType: new Types.ObjectId(dto.shiftType),
            startTime: dto.startTime,
            endTime: dto.endTime,
            punchPolicy: dto.punchPolicy,
            graceInMinutes: dto.graceInMinutes ?? 0,
            graceOutMinutes: dto.graceOutMinutes ?? 0,
            requiresApprovalForOvertime: dto.requiresApprovalForOvertime ?? false,
            active: dto.active ?? true,
        });

        return doc.save();
    }

    async getShifts(filter: Partial<Record<string, any>> = {}): Promise<Shift[]> {
        return this.shiftModel.find(filter).lean();
    }

    async updateShift(id: string, dto: UpdateShiftDto): Promise<Shift> {
        const updated = await this.shiftModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('Shift not found');
        return updated as Shift;
    }

    async deactivateShift(id: string): Promise<void> {
        const res = await this.shiftModel.findByIdAndUpdate(id, { active: false });
        if (!res) throw new NotFoundException('Shift not found');
    }

    // --------------------------
    // ScheduleRule
    // --------------------------
    async createScheduleRule(dto: CreateScheduleRuleDto): Promise<ScheduleRule> {
        const exists = await this.scheduleRuleModel.findOne({ name: dto.name }).lean();
        if (exists) throw new ConflictException('ScheduleRule name already exists');
        const r = new this.scheduleRuleModel({ name: dto.name, pattern: dto.pattern, active: dto.active ?? true });
        return r.save();
    }

    async getScheduleRules(): Promise<ScheduleRule[]> {
        return this.scheduleRuleModel.find().lean();
    }

    async updateScheduleRule(id: string, dto: UpdateScheduleRuleDto): Promise<ScheduleRule> {
        const updated = await this.scheduleRuleModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('ScheduleRule not found');
        return updated as ScheduleRule;
    }

    // --------------------------
    // Shift Assignment
    // --------------------------
    // FR: assign shifts to employee/department/position; BR: no overlapping assignments
    async assignShiftToEmployee(dto: AssignShiftDto): Promise<ShiftAssignment> {
        // validate shift exists
        const shift = await this.shiftModel.findById(dto.shiftId).lean();
        if (!shift) throw new BadRequestException('Shift not found');

        if (!dto.employeeId && !dto.departmentId && !dto.positionId) {
            throw new BadRequestException('employeeId or departmentId or positionId required');
        }

        // check overlapping constraint: for the same target (employee/department/position), dates mustn't overlap
        const searchTargets: any[] = [];
        if (dto.employeeId) searchTargets.push({ employeeId: new Types.ObjectId(dto.employeeId) });
        if (dto.departmentId) searchTargets.push({ departmentId: new Types.ObjectId(dto.departmentId) });
        if (dto.positionId) searchTargets.push({ positionId: new Types.ObjectId(dto.positionId) });

        const overlapQuery = {
            $and: [
                { $or: searchTargets },
                { status: { $in: ['PENDING', 'APPROVED'] } },
                { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: dto.startDate } }] },
                { startDate: { $lte: dto.endDate ?? new Date('9999-12-31') } },
            ],
        };

        const overlapping = await this.shiftAssignmentModel.findOne(overlapQuery).lean();
        if (overlapping) throw new ConflictException('Assignment overlaps an existing assignment');

        const assignment = new this.shiftAssignmentModel({
            employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : undefined,
            departmentId: dto.departmentId ? new Types.ObjectId(dto.departmentId) : undefined,
            positionId: dto.positionId ? new Types.ObjectId(dto.positionId) : undefined,
            shiftId: new Types.ObjectId(dto.shiftId),
            scheduleRuleId: dto.scheduleRuleId ? new Types.ObjectId(dto.scheduleRuleId) : undefined,
            startDate: dto.startDate,
            endDate: dto.endDate,
            status: dto.status ?? 'PENDING',
        });

        const saved = await assignment.save();

        // create a notification log entry (FR: notify manager/employee on assignment)
        try {
            await this.notificationModel.create({
                to: dto.createdBy ? new Types.ObjectId(dto.createdBy) : null,
                type: 'SHIFT_ASSIGNED',
                message: `Shift assignment ${saved._id} created`,
            });
        } catch (e) {
            this.logger.error('Failed to create notification log', e?.message ?? e);
        }

        return saved;
    }

    async bulkAssignShift(dto: BulkAssignShiftDto): Promise<ShiftAssignment[]> {
        const results: ShiftAssignment[] = [];
        if (!dto.targets || dto.targets.length === 0) throw new BadRequestException('targets required');

        for (const t of dto.targets) {
            try {
                const assignDto: AssignShiftDto = {
                    employeeId: t.employeeId,
                    departmentId: t.departmentId,
                    positionId: t.positionId,
                    shiftId: dto.shiftId,
                    scheduleRuleId: dto.scheduleRuleId,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    status: dto.status,
                    createdBy: dto.createdBy,
                } as AssignShiftDto;

                const created = await this.assignShiftToEmployee(assignDto);
                results.push(created);
            } catch (err) {
                this.logger.warn(`Bulk assign skipped target due to: ${err.message}`);
                // continue with next target (best-effort as specified in requirements)
            }
        }

        return results;
    }

    async getAssignmentsForEmployee(employeeId: string): Promise<ShiftAssignment[]> {
        return this.shiftAssignmentModel.find({ employeeId: new Types.ObjectId(employeeId) }).lean();
    }

    async renewAssignment(id: string, dto: RenewAssignmentDto): Promise<ShiftAssignment> {
        const assignment = await this.shiftAssignmentModel.findById(id);
        if (!assignment) throw new NotFoundException('Assignment not found');
        if (dto.startDate) assignment.startDate = dto.startDate;
        if (dto.endDate) assignment.endDate = dto.endDate;
        if (dto.scheduleRuleId) assignment.scheduleRuleId = new Types.ObjectId(dto.scheduleRuleId);
        if (dto.status) assignment.status = dto.status as any;
        await assignment.save();
        return assignment.toObject() as ShiftAssignment;
    }

    async expireAssignment(id: string): Promise<void> {
        const assignment = await this.shiftAssignmentModel.findById(id);
        if (!assignment) throw new NotFoundException('Assignment not found');
        assignment.endDate = new Date();
        assignment.status = 'EXPIRED' as any;
        await assignment.save();
        // notify employee
        try {
            await this.notificationModel.create({
                to: assignment.employeeId ? assignment.employeeId as any : null,
                type: 'SHIFT_EXPIRED',
                message: `Your shift assignment ${assignment._id} expired`,
            });
        } catch (e) {
            this.logger.warn('Failed to log expire notification');
        }
    }

    async validateShiftOverlap(employeeId: string | Types.ObjectId, startDate: Date, endDate?: Date): Promise<boolean> {
        const eId = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;
        const overlapping = await this.shiftAssignmentModel.findOne({
            employeeId: eId,
            status: { $in: ['PENDING', 'APPROVED'] },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: startDate } }],
            startDate: { $lte: endDate ?? new Date('9999-12-31') },
        }).lean();
        return !!overlapping;
    }

    // --------------------------
    // Holiday CRUD + detection
    // --------------------------
    async createHoliday(dto: CreateHolidayDto): Promise<Holiday> {
        const h = new this.holidayModel({
            type: dto.type,
            startDate: dto.startDate,
            endDate: dto.endDate,
            name: dto.name,
            active: dto.active ?? true,
        });
        return h.save();
    }

    async getHolidays(filter: Partial<Record<string, any>> = {}): Promise<Holiday[]> {
        return this.holidayModel.find(filter).lean();
    }

    async updateHoliday(id: string, dto: UpdateHolidayDto): Promise<Holiday> {
        const updated = await this.holidayModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('Holiday not found');
        return updated as Holiday;
    }

    async deactivateHoliday(id: string): Promise<void> {
        const res = await this.holidayModel.findByIdAndUpdate(id, { active: false });
        if (!res) throw new NotFoundException('Holiday not found');
    }

    // returns true if provided date is part of an active holiday (BR: calendars integrated with attendance)
    async isHoliday(date: Date): Promise<boolean> {
        const s = new Date(date); s.setHours(0,0,0,0);
        const e = new Date(date); e.setHours(23,59,59,999);
        const found = await this.holidayModel.findOne({
            active: true,
            $or: [
                { startDate: { $lte: e }, endDate: { $gte: s } }, // range contains date
                { startDate: { $gte: s, $lte: e }, endDate: { $exists: false } }, // single-day holiday
            ],
        }).lean();
        return !!found;
    }

    // --------------------------
    // Lateness rules
    // --------------------------
    async createLatenessRule(dto: CreateLatenessRuleDto): Promise<LatenessRule> {
        const r = new this.latenessRuleModel({
            name: dto.name,
            description: dto.description,
            gracePeriodMinutes: dto.gracePeriodMinutes ?? 0,
            deductionForEachMinute: dto.deductionForEachMinute ?? 0,
            active: dto.active ?? true,
        });
        return r.save();
    }

    async getLatenessRules(): Promise<LatenessRule[]> {
        return this.latenessRuleModel.find().lean();
    }

    async updateLatenessRule(id: string, dto: UpdateLatenessRuleDto): Promise<LatenessRule> {
        const updated = await this.latenessRuleModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('LatenessRule not found');
        return updated as LatenessRule;
    }

    // --------------------------
    // Overtime rules
    // --------------------------
    async createOvertimeRule(dto: CreateOvertimeRuleDto): Promise<OvertimeRule> {
        const r = new this.overtimeRuleModel({
            name: dto.name,
            description: dto.description,
            active: dto.active ?? true,
            approved: dto.approved ?? false,
        });
        return r.save();
    }

    async getOvertimeRules(): Promise<OvertimeRule[]> {
        return this.overtimeRuleModel.find().lean();
    }

    async updateOvertimeRule(id: string, dto: UpdateOvertimeRuleDto): Promise<OvertimeRule> {
        const updated = await this.overtimeRuleModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated) throw new NotFoundException('OvertimeRule not found');
        return updated as OvertimeRule;
    }

    async approveOvertimeRule(id: string): Promise<OvertimeRule> {
        const rule = await this.overtimeRuleModel.findById(id);
        if (!rule) throw new NotFoundException('OvertimeRule not found');
        rule.approved = true;
        await rule.save();
        return rule.toObject() as OvertimeRule;
    }

    // --------------------------
    // Notification helper
    // --------------------------
    async notify(to: Types.ObjectId | string | null, type: string, message?: string) {
        try {
            const toId = to ? (typeof to === 'string' ? new Types.ObjectId(to) : to) : null;
            return this.notificationModel.create({ to: toId, type, message });
        } catch (e) {
            this.logger.warn('Failed to write notification log: ' + (e?.message ?? e));
            return null;
        }
    }
}
