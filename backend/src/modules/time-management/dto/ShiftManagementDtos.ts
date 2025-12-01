import { HolidayType, PunchPolicy } from "../models/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateShiftTypeDto {
    @ApiProperty({
        description: 'Name of the shift type',
        example: 'Morning Shift'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Whether this shift type is active',
        default: true
    })
    active?: boolean;
}

export class UpdateShiftTypeDto {
    @ApiPropertyOptional({
        description: 'Name of the shift type',
        example: 'Morning Shift'
    })
    name?: string;


    @ApiPropertyOptional({
        description: 'Whether this shift type is active'
    })
    active?: boolean;
}

export class CreateShiftDto {
    name: string;
    shiftType: string; // ObjectId string
    startTime: string; // 'HH:mm'
    endTime: string;   // 'HH:mm'
    punchPolicy?: PunchPolicy;
    graceInMinutes?: number;
    graceOutMinutes?: number;
    requiresApprovalForOvertime?: boolean;
    active?: boolean;
}

export class UpdateShiftDto {
    name?: string;
    shiftType?: string;
    startTime?: string;
    endTime?: string;
    punchPolicy?: PunchPolicy;
    graceInMinutes?: number;
    graceOutMinutes?: number;
    requiresApprovalForOvertime?: boolean;
    active?: boolean;
}

export class CreateScheduleRuleDto {
    name: string;
    pattern: string; // simple pattern string, e.g. "WEEKLY:Mon,Tue,Wed" or cron-like
    active?: boolean;
}

export class UpdateScheduleRuleDto {
    name?: string;
    pattern?: string;
    active?: boolean;
}

// src/time-management/shift-management/dtos/shift-assignment.dtos.ts
export class AssignShiftDto {
    employeeId?: string;
    departmentId?: string;
    positionId?: string;
    shiftId: string;
    scheduleRuleId?: string;
    startDate: Date;
    endDate?: Date;
    status?: string; // PENDING/APPROVED/CANCELLED/EXPIRED
    createdBy?: string; // userId who created
}

export class BulkAssignTarget {
    employeeId?: string;
    departmentId?: string;
    positionId?: string;
}

export class BulkAssignShiftDto {
    shiftId: string;
    targets: BulkAssignTarget[]; // list of targets
    scheduleRuleId?: string;
    startDate: Date;
    endDate?: Date;
    status?: string;
    createdBy?: string;
}

export class RenewAssignmentDto {
    startDate?: Date;
    endDate?: Date;
    scheduleRuleId?: string;
    status?: string;
}

export class CreateHolidayDto {
    type: HolidayType;
    startDate: Date;
    endDate?: Date;
    name?: string;
    active?: boolean;
}

export class UpdateHolidayDto {
    startDate?: Date;
    endDate?: Date;
    name?: string;
    active?: boolean;
}
// src/time-management/shift-management/dtos/lateness-rule.dtos.ts
export class CreateLatenessRuleDto {
    name: string;
    description?: string;
    gracePeriodMinutes?: number;
    deductionForEachMinute?: number;
    active?: boolean;
}

export class UpdateLatenessRuleDto {
    name?: string;
    description?: string;
    gracePeriodMinutes?: number;
    deductionForEachMinute?: number;
    active?: boolean;
}
// src/time-management/shift-management/dtos/overtime-rule.dtos.ts
export class CreateOvertimeRuleDto {
    name: string;
    description?: string;
    active?: boolean;
    approved?: boolean;
}

export class UpdateOvertimeRuleDto {
    name?: string;
    description?: string;
    active?: boolean;
    approved?: boolean;
}


