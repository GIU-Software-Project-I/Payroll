// src/time-management/attendance/attendance.controller.ts

import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Query,Logger,
    BadRequestException, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import {
    PunchInDto,
    PunchOutDto,
    UpdateAttendanceRecordDto,
} from '../dto/AttendanceDtos';
import { AttendanceService } from "../services/AttendanceService";

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}
    private readonly logger = new Logger(AttendanceController.name);

    // --------------------------------------------------
    // PUNCH IN
    // -
    //-------------------------------------------------
    @Post('punch-in')
    @ApiOperation({ summary: 'Punch In', description: 'Record employee clock-in time' })
    @ApiBody({ type: PunchInDto })
    @ApiResponse({ status: 201, description: 'Successfully punched in' })
    @ApiResponse({ status: 400, description: 'Bad request - employeeId is required' })
    async punchIn(@Body() dto: PunchInDto) {
        if (!dto.employeeId)
            throw new BadRequestException('employeeId is required');
        return this.attendanceService.punchIn(dto);
    }

    // --------------------------------------------------
    // PUNCH OUT
    // --------------------------------------------------
    @Post('punch-out')
    @ApiOperation({ summary: 'Punch Out', description: 'Record employee clock-out time' })
    @ApiBody({ type: PunchOutDto })
    @ApiResponse({ status: 201, description: 'Successfully punched out' })
    @ApiResponse({ status: 400, description: 'Bad request - employeeId is required' })
    async punchOut(@Body() dto: PunchOutDto) {
        if (!dto.employeeId)
            throw new BadRequestException('employeeId is required');
        return this.attendanceService.punchOut(dto);
    }

    // --------------------------------------------------
    // Get today's attendance for employee
    // --------------------------------------------------
    @Get('today/:employeeId')
    async getToday(@Param('employeeId') employeeId: string) {
        return this.attendanceService.getTodayRecord(employeeId);
    }

    // --------------------------------------------------
    // Get monthly attendance (employee)
    // --------------------------------------------------
    @Get('month/:employeeId')
    async getMonthly(
        @Param('employeeId') employeeId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        const m = Number(month);
        const y = Number(year);
        if (!m || !y) throw new BadRequestException('month and year required');
        return this.attendanceService.getMonthlyAttendance(employeeId, m, y);
    }

    // --------------------------------------------------
    // Get payroll-ready attendance
    // --------------------------------------------------
    @Get('payroll')
    async payroll(
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        const m = Number(month);
        const y = Number(year);
        if (!m || !y) throw new BadRequestException('month and year required');
        return this.attendanceService.getPayrollReadyAttendance(m, y);
    }

    // --------------------------------------------------
    // Update attendance record
    // --------------------------------------------------
    @Put(':id')
    async updateRecord(
        @Param('id') id: string,
        @Body() dto: UpdateAttendanceRecordDto,
    ) {
        return this.attendanceService.updateAttendanceRecord(id, dto);
    }
}
