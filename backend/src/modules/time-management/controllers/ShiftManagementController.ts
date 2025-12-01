import { Controller, Get, Post, Patch, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import {
    AssignShiftDto, BulkAssignShiftDto, CreateHolidayDto, CreateLatenessRuleDto, CreateOvertimeRuleDto,
    CreateScheduleRuleDto,
    CreateShiftDto,
    CreateShiftTypeDto, RenewAssignmentDto, UpdateHolidayDto, UpdateLatenessRuleDto,
    UpdateOvertimeRuleDto, UpdateScheduleRuleDto,
    UpdateShiftDto,
    UpdateShiftTypeDto
} from "../dto/ShiftManagementDtos";
import {ShiftManagementService} from "../services/ShiftManagementService";
//import {SystemRole} from "../../Employee-Profile-Organization-Structure-and-Performance/backend/src/enums/employee-profile.enums";
//import {Roles} from "../auth/decorators/Roles-Decorator";

@ApiTags('Shift Management')
@Controller('shift-management')
export class ShiftManagementController {
    constructor(private readonly service: ShiftManagementService) {}

    // Shift Types
    @Post('shift-types')
    @ApiOperation({
        summary: 'Create Shift Type',
        description: 'HR Manager/Admin defines standardized shift configurations'
    })
    @ApiBody({
        type: CreateShiftTypeDto,
        examples: {
            'Example 1': {
                value: {
                    name: 'Morning Shift',
                    active: true
                }
            },
            'Example 2': {
                value: {
                    name: 'Night Shift',
                    active: true
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Shift type created successfully' })
    @ApiResponse({ status: 409, description: 'Shift type already exists' })
    createShiftType(@Body() dto: CreateShiftTypeDto) {
        return this.service.createShiftType(dto);
    }

    @Get('shift-types')
    @ApiOperation({ summary: 'Get All Shift Types' })
    @ApiResponse({ status: 200, description: 'List of shift types' })
    getShiftTypes() {
        return this.service.getShiftTypes();
    }

    @Patch('shift-types/:id')
    @ApiOperation({ summary: 'Update Shift Type' })
    @ApiParam({ name: 'id', description: 'Shift Type ID' })
    @ApiBody({ type: UpdateShiftTypeDto })
    @ApiResponse({ status: 200, description: 'Shift type updated' })
    @ApiResponse({ status: 404, description: 'Shift type not found' })
    updateShiftType(@Param('id') id: string, @Body() dto: UpdateShiftTypeDto) {
        return this.service.updateShiftType(id, dto);
    }

    @Delete('shift-types/:id')
    @ApiOperation({ summary: 'Deactivate Shift Type' })
    @ApiParam({ name: 'id', description: 'Shift Type ID' })
    @ApiResponse({ status: 200, description: 'Shift type deactivated' })
    @ApiResponse({ status: 404, description: 'Shift type not found' })
    deactivateShiftType(@Param('id') id: string) {
        return this.service.deactivateShiftType(id);
    }

    // Shifts
    @Post('shifts')
    createShift(@Body() dto: CreateShiftDto) {
        return this.service.createShift(dto);
    }

    @Get('shifts')
    getShifts(@Query() filter: any) {
        return this.service.getShifts(filter);
    }

    @Patch('shifts/:id')
    updateShift(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
        return this.service.updateShift(id, dto);
    }

    @Delete('shifts/:id')
    deactivateShift(@Param('id') id: string) {
        return this.service.deactivateShift(id);
    }

    // Schedule Rules
    @Post('schedule-rules')
    createScheduleRule(@Body() dto: CreateScheduleRuleDto) {
        return this.service.createScheduleRule(dto);
    }

    @Get('schedule-rules')
    getScheduleRules() {
        return this.service.getScheduleRules();
    }

    @Patch('schedule-rules/:id')
    updateScheduleRule(@Param('id') id: string, @Body() dto: UpdateScheduleRuleDto) {
        return this.service.updateScheduleRule(id, dto);
    }

    // Shift Assignments
    @Post('assignments')
    assignShift(@Body() dto: AssignShiftDto) {
        return this.service.assignShiftToEmployee(dto);
    }

    @Post('assignments/bulk')
    bulkAssignShift(@Body() dto: BulkAssignShiftDto) {
        return this.service.bulkAssignShift(dto);
    }

    @Get('assignments/employee/:employeeId')
    getAssignmentsForEmployee(@Param('employeeId') employeeId: string) {
        return this.service.getAssignmentsForEmployee(employeeId);
    }

    @Patch('assignments/:id')
    renewAssignment(@Param('id') id: string, @Body() dto: RenewAssignmentDto) {
        return this.service.renewAssignment(id, dto);
    }

    @Delete('assignments/:id')
    expireAssignment(@Param('id') id: string) {
        return this.service.expireAssignment(id);
    }

    // Holidays
    @Post('holidays')
    createHoliday(@Body() dto: CreateHolidayDto) {
        return this.service.createHoliday(dto);
    }

    @Get('holidays')
    getHolidays(@Query() filter: any) {
        return this.service.getHolidays(filter);
    }

    @Patch('holidays/:id')
    updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
        return this.service.updateHoliday(id, dto);
    }

    @Delete('holidays/:id')
    deactivateHoliday(@Param('id') id: string) {
        return this.service.deactivateHoliday(id);
    }

    // Lateness Rules
    @Post('lateness-rules')
    createLatenessRule(@Body() dto: CreateLatenessRuleDto) {
        return this.service.createLatenessRule(dto);
    }

    @Get('lateness-rules')
    getLatenessRules() {
        return this.service.getLatenessRules();
    }

    @Patch('lateness-rules/:id')
    updateLatenessRule(@Param('id') id: string, @Body() dto: UpdateLatenessRuleDto) {
        return this.service.updateLatenessRule(id, dto);
    }

    // Overtime Rules
    @Post('overtime-rules')
    createOvertimeRule(@Body() dto: CreateOvertimeRuleDto) {
        return this.service.createOvertimeRule(dto);
    }

    @Get('overtime-rules')
    getOvertimeRules() {
        return this.service.getOvertimeRules();
    }

    @Patch('overtime-rules/:id')
    updateOvertimeRule(@Param('id') id: string, @Body() dto: UpdateOvertimeRuleDto) {
        return this.service.updateOvertimeRule(id, dto);
    }

    @Post('overtime-rules/:id/approve')
    approveOvertime(@Param('id') id: string) {
        return this.service.approveOvertimeRule(id);
    }
}
