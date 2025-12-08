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


    @ApiProperty({
        description: 'Name of the shift',
        example: 'Morning Shift 9-5',
        default: 'Morning Shift 9-5'
    })
    name: string = 'Morning Shift 9-5';

    @ApiProperty({
        description: 'Shift Type ID (ObjectId)',
        example: '674c1a1b2c3d4e5f6a7b8c9d',
        default: '674c1a1b2c3d4e5f6a7b8c9d'
    })
    shiftType: string = '674c1a1b2c3d4e5f6a7b8c9d'; // ObjectId string

    @ApiProperty({
        description: 'Shift start time in HH:mm format (24-hour)',
        example: '09:00',
        default: '09:00'
    })
    startTime: string = '09:00'; // 'HH:mm'

    @ApiProperty({
        description: 'Shift end time in HH:mm format (24-hour)',
        example: '17:00',
        default: '17:00'
    })
    endTime: string = '17:00';   // 'HH:mm'

    @ApiPropertyOptional({
        description: 'Punch policy: FIRST_LAST (only first IN and last OUT) or MULTIPLE (all punches)',
        enum: ['FIRST_LAST', 'MULTIPLE', 'ONLY_FIRST'],
        example: 'FIRST_LAST',
        default: 'FIRST_LAST'
    })
    punchPolicy?: PunchPolicy = PunchPolicy.FIRST_LAST;

    @ApiPropertyOptional({
        description: 'Grace period in minutes before shift start time',
        example: 15,
        default: 15
    })
    graceInMinutes?: number = 15;

    @ApiPropertyOptional({
        description: 'Grace period in minutes after shift end time',
        example: 30,
        default: 30
    })
    graceOutMinutes?: number = 30;

    @ApiPropertyOptional({
        description: 'Whether overtime requires manager approval',
        example: false,
        default: false
    })
    requiresApprovalForOvertime?: boolean = false;

    @ApiPropertyOptional({
        description: 'Whether the shift is active',
        example: true,
        default: true
    })
    active?: boolean = true;

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



    @ApiProperty({
        description: 'Name of the schedule rule',
        example: 'Weekly Office Hours'
    })
    name: string;

    @ApiProperty({
        description: 'Pattern string defining the schedule. Examples: "WEEKLY:Mon,Tue,Wed,Thu,Fri", "DAILY:09:00-17:00", or cron-like patterns',
        example: 'WEEKLY:Mon,Tue,Wed,Thu,Fri'
    })
    pattern: string;

    @ApiPropertyOptional({
        description: 'Whether the schedule rule is active',
        default: true
    })

    active?: boolean;
}

export class UpdateScheduleRuleDto {


    @ApiPropertyOptional({
        description: 'Name of the schedule rule',
        example: 'Updated Weekly Schedule'
    })
    name?: string;

    @ApiPropertyOptional({
        description: 'Pattern string defining the schedule',
        example: 'WEEKLY:Mon,Wed,Fri'
    })
    pattern?: string;

    @ApiPropertyOptional({
        description: 'Whether the schedule rule is active'
    })

    active?: boolean;
}

// src/time-management/shift-management/dtos/shift-assignment.dtos.ts
export class AssignShiftDto {


    @ApiPropertyOptional({
        description: 'Target specific employee by their ID (MongoDB ObjectId). Use this for individual assignment.',
        example: '674c1a1b2c3d4e5f6a7b8c9d'
    })
    employeeId?: string;

    @ApiPropertyOptional({
        description: 'Target all employees in a specific department (MongoDB ObjectId). System will assign to all ACTIVE employees in this department.',
        example: '674c1a1b2c3d4e5f6a7b8c8a'
    })
    departmentId?: string;

    @ApiPropertyOptional({
        description: 'Target all employees in a specific position (MongoDB ObjectId). System will assign to all ACTIVE employees holding this position.',
        example: '674c1a1b2c3d4e5f6a7b8c8b'
    })
    positionId?: string;

    @ApiProperty({
        description: 'The shift to assign (MongoDB ObjectId)',
        example: '674c1a1b2c3d4e5f6a7b8d01'
    })
    shiftId: string;

    @ApiPropertyOptional({
        description: 'Schedule rule for rotating shifts (MongoDB ObjectId)',
        example: '674c1a1b2c3d4e5f6a7b8d02'
    })
    scheduleRuleId?: string;

    @ApiProperty({
        description: 'Start date of the shift assignment (ISO 8601 format)',
        example: '2025-12-01T00:00:00.000Z'
    })
    startDate: Date;

    @ApiPropertyOptional({
        description: 'End date of the shift assignment (ISO 8601 format). Leave empty for permanent assignment.',
        example: '2026-12-31T23:59:59.000Z'
    })
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'Assignment status',
        enum: ['PENDING', 'APPROVED', 'CANCELLED', 'EXPIRED'],
        example: 'APPROVED',
        default: 'PENDING'
    })
    status?: string; // PENDING/APPROVED/CANCELLED/EXPIRED

    @ApiPropertyOptional({
        description: 'User ID who created this assignment (MongoDB ObjectId)',
        example: '674c1a1b2c3d4e5f6a7b8d03'
    })

    createdBy?: string; // userId who created
}

export class BulkAssignTarget {
    employeeId?: string;
    departmentId?: string;
    positionId?: string;
}

export class BulkAssignShiftDto {

    @ApiProperty({
        description: 'The shift to assign (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439011'
    })
    shiftId: string;

    @ApiProperty({
        description: 'Array of assignment targets. Each target must have at least one of: employeeId, departmentId, or positionId',
        type: [BulkAssignTarget],
        example: [
            { employeeId: '507f1f77bcf86cd799439013' },
            { departmentId: '507f1f77bcf86cd799439020' }
        ]
    })
    targets: BulkAssignTarget[];

    @ApiPropertyOptional({
        description: 'Schedule rule for rotating shifts (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439040'
    })
    scheduleRuleId?: string;

    @ApiProperty({
        description: 'Start date of the assignment (ISO 8601 format)',
        example: '2025-12-01T00:00:00.000Z'
    })
    startDate: Date;

    @ApiPropertyOptional({
        description: 'End date of the assignment (ISO 8601 format). Leave empty for permanent assignment',
        example: '2026-12-31T23:59:59.000Z'
    })
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'Assignment status',
        enum: ['PENDING', 'APPROVED', 'CANCELLED', 'EXPIRED'],
        example: 'APPROVED'
    })
    status?: string;

    @ApiPropertyOptional({
        description: 'User ID who created this assignment (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439050'
    })

    createdBy?: string;
}

export class RenewAssignmentDto {
    startDate?: Date;
    endDate?: Date;
    scheduleRuleId?: string;
    status?: string;
}


export class UpdateShiftAssignmentStatusDto {
    @ApiProperty({
        description: 'New status for the shift assignment',
        enum: ['PENDING', 'APPROVED', 'CANCELLED', 'EXPIRED'],
        example: 'APPROVED'
    })
    status: string; // ShiftAssignmentStatus

    @ApiPropertyOptional({
        description: 'Optional reason or note for the status change',
        example: 'Approved by manager after review'
    })
    reason?: string;

    @ApiPropertyOptional({
        description: 'User ID who updated the status (MongoDB ObjectId)',
        example: '674c1a1b2c3d4e5f6a7b8d03'
    })
    updatedBy?: string;
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


