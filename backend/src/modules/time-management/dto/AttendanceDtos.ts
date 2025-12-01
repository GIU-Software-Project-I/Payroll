
/* ==========================
   DTOs (all in one file as requested)
   Place these classes near the service file or export them as needed.
   ========================== */

// Punch DTOs
import { PunchType } from "../models/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PunchDto {
    @ApiProperty({ enum: PunchType, description: 'Type of punch (IN or OUT)' })
    type: PunchType;

    @ApiPropertyOptional({
        type: String,
        description: 'Punch time in format dd/mm/yyyy hh:mm (defaults to server time if not provided)',
        example: '01/12/2025 14:30'
    })
    time?: Date;
}

// Punch in/out DTOs
export class PunchInDto {
    @ApiProperty({
        description: 'Employee ID',
        example: '692cdd8e67a40875239080d0',
        default: '692cdd8e67a40875239080d0'
    })
    employeeId: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Punch in time in format dd/mm/yyyy hh:mm (optional - server time used if absent)',
        example: '01/12/2025 14:30'
    })
    time?: Date;

    @ApiPropertyOptional({
        description: 'Source of punch (device id / ip / etc)',
        example: 'web-app'
    })
    source?: string;
}

export class PunchOutDto {
    @ApiProperty({
        description: 'Employee ID',
        example: '692cdd8e67a40875239080d0',
        default: '692cdd8e67a40875239080d0'
    })
    employeeId: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Punch out time in format dd/mm/yyyy hh:mm (optional - server time used if absent)',
        example: '01/12/2025 18:30'
    })
    time?: Date;

    @ApiPropertyOptional({
        description: 'Source of punch (device id / ip / etc)',
        example: 'web-app'
    })
    source?: string;
}

// Update attendance record DTO
export class UpdateAttendanceRecordDto {
    punches?: PunchDto[]; // full replacement of punches array (used carefully)
    finalisedForPayroll?: boolean;
    // any other admin-provided fields
}

// Payroll export filter DTO (if needed)
export class PayrollExportDto {
    month: number; // 1-12
    year: number;
}

// Simple query DTOs
export class GetMonthlyAttendanceDto {
    employeeId: string;
    month: number;
    year: number;
}
