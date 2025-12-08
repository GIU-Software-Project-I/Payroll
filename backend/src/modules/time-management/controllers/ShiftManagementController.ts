import { AttendanceService } from "../services/AttendanceService";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    Query
} from "@nestjs/common";
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";

import {ShiftManagementService} from "../services/ShiftManagementService";
import {
    AssignShiftDto, BulkAssignShiftDto, CreateHolidayDto, CreateLatenessRuleDto, CreateOvertimeRuleDto,
    CreateScheduleRuleDto, CreateShiftDto,
    CreateShiftTypeDto, RenewAssignmentDto, UpdateHolidayDto, UpdateLatenessRuleDto,
    UpdateOvertimeRuleDto, UpdateScheduleRuleDto, UpdateShiftAssignmentStatusDto,
    UpdateShiftDto,
    UpdateShiftTypeDto
} from "../dto/ShiftManagementDtos";



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
    @ApiOperation({
        summary: 'Create Shift',
        description: 'Create a new shift with specific time range, punch policy, and grace periods. Default example shows a standard morning shift with FIRST_LAST policy.'
    })
    @ApiBody({
        type: CreateShiftDto,
        description: 'Shift configuration with default values pre-filled',
        examples: {
            'Morning Shift (FIRST_LAST - Default)': {
                summary: 'Standard morning shift 9-5 with FIRST_LAST policy',
                description: 'Records only first IN and last OUT punches',
                value: {
                    name: 'Morning Shift 9-5',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '09:00',
                    endTime: '17:00',
                    punchPolicy: 'FIRST_LAST',
                    graceInMinutes: 15,
                    graceOutMinutes: 30,
                    requiresApprovalForOvertime: false,
                    active: true
                }
            },
            'Afternoon Shift (FIRST_LAST)': {
                summary: 'Afternoon shift 1-9 PM',
                description: 'Standard afternoon shift with FIRST_LAST policy',
                value: {
                    name: 'Afternoon Shift 1-9',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '13:00',
                    endTime: '21:00',
                    punchPolicy: 'FIRST_LAST',
                    graceInMinutes: 10,
                    graceOutMinutes: 20,
                    requiresApprovalForOvertime: false,
                    active: true
                }
            },
            'Night Shift (FIRST_LAST)': {
                summary: 'Night shift 10 PM - 6 AM',
                description: 'Overnight shift crossing midnight',
                value: {
                    name: 'Night Shift 10-6',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '22:00',
                    endTime: '06:00',
                    punchPolicy: 'FIRST_LAST',
                    graceInMinutes: 15,
                    graceOutMinutes: 15,
                    requiresApprovalForOvertime: true,
                    active: true
                }
            },
            'Flexible Hours (MULTIPLE)': {
                summary: 'Flexible schedule with multiple punch tracking',
                description: 'Records all IN/OUT punches for break tracking',
                value: {
                    name: 'Flexible Hours',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '09:00',
                    endTime: '17:00',
                    punchPolicy: 'MULTIPLE',
                    graceInMinutes: 15,
                    graceOutMinutes: 30,
                    requiresApprovalForOvertime: false,
                    active: true
                }
            },
            'Part-Time Shift (FIRST_LAST)': {
                summary: 'Part-time 4-hour shift',
                description: 'Short shift for part-time employees',
                value: {
                    name: 'Part-Time 9-1',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '09:00',
                    endTime: '13:00',
                    punchPolicy: 'FIRST_LAST',
                    graceInMinutes: 10,
                    graceOutMinutes: 10,
                    requiresApprovalForOvertime: false,
                    active: true
                }
            },
            'Split Shift (MULTIPLE)': {
                summary: 'Split shift with break tracking',
                description: 'Flexible shift requiring all punch tracking',
                value: {
                    name: 'Split Shift',
                    shiftType: '674c1a1b2c3d4e5f6a7b8c9d',
                    startTime: '08:00',
                    endTime: '18:00',
                    punchPolicy: 'MULTIPLE',
                    graceInMinutes: 20,
                    graceOutMinutes: 20,
                    requiresApprovalForOvertime: false,
                    active: true
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Shift created successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '674c1a1b2c3d4e5f6a7b8c9d' },
                name: { type: 'string', example: 'Morning Shift 9-5' },
                shiftType: { type: 'string', example: '674c1a1b2c3d4e5f6a7b8c9d' },
                startTime: { type: 'string', example: '09:00' },
                endTime: { type: 'string', example: '17:00' },
                punchPolicy: { type: 'string', example: 'FIRST_LAST' },
                graceInMinutes: { type: 'number', example: 15 },
                graceOutMinutes: { type: 'number', example: 30 },
                requiresApprovalForOvertime: { type: 'boolean', example: false },
                active: { type: 'boolean', example: true }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid shift configuration' })
    @ApiResponse({ status: 404, description: 'Shift type not found' })
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

    @ApiOperation({
        summary: 'Create Schedule Rule',
        description: 'HR Manager/Admin creates a scheduling rule with a specific pattern (e.g., weekly, daily, or custom patterns)'
    })
    @ApiBody({
        type: CreateScheduleRuleDto,
        examples: {
            'Weekly Office Hours': {
                value: {
                    name: 'Weekly Office Hours',
                    pattern: 'WEEKLY:Mon,Tue,Wed,Thu,Fri',
                    active: true
                }
            },
            'Daily Morning Shift': {
                value: {
                    name: 'Daily Morning Shift',
                    pattern: 'DAILY:09:00-17:00',
                    active: true
                }
            },
            'Weekend Schedule': {
                value: {
                    name: 'Weekend Only',
                    pattern: 'WEEKLY:Sat,Sun',
                    active: false
                }
            },
            'Rotating Shift': {
                value: {
                    name: 'Rotating 3-2 Schedule',
                    pattern: 'ROTATION:3days-on-2days-off',
                    active: true
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Schedule rule created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 409, description: 'Schedule rule already exists' })
    createScheduleRule(@Body() dto: CreateScheduleRuleDto) {
        return this.service.createScheduleRule(dto);
    }

    @Get('schedule-rules')

    @ApiOperation({
        summary: 'Get All Schedule Rules',
        description: 'Retrieve all schedule rules in the system'
    })
    @ApiResponse({ status: 200, description: 'List of schedule rules' })
    getScheduleRules() {
        return this.service.getScheduleRules();
    }

    @Patch('schedule-rules/:id')
    @ApiOperation({
        summary: 'Update Schedule Rule',
        description: 'Update an existing schedule rule by ID'
    })
    @ApiParam({ name: 'id', description: 'Schedule Rule ID (MongoDB ObjectId)' })
    @ApiBody({ type: UpdateScheduleRuleDto })
    @ApiResponse({ status: 200, description: 'Schedule rule updated successfully' })
    @ApiResponse({ status: 404, description: 'Schedule rule not found' })

    updateScheduleRule(@Param('id') id: string, @Body() dto: UpdateScheduleRuleDto) {
        return this.service.updateScheduleRule(id, dto);
    }

    // Shift Assignments
    @Post('assignments')

    @ApiOperation({
        summary: 'Assign Shift (Individual, Department, or Position)',
        description: 'HR Manager/Admin assigns a shift to an employee, all employees in a department, or all employees in a position. At least one target (employeeId, departmentId, or positionId) must be provided.'
    })
    @ApiBody({
        type: AssignShiftDto,
        description: 'Shift assignment data. Provide ONE of: employeeId (individual), departmentId (all in dept), or positionId (all in position).',
        examples: {
            'Assign to Individual Employee': {
                summary: 'Assign shift to a specific employee',
                value: {
                    employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Assign to Department': {
                summary: 'Assign shift to all employees in IT department',
                value: {
                    departmentId: '674c1a1b2c3d4e5f6a7b8c8a',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Assign to Position': {
                summary: 'Assign shift to all employees with Senior Developer position',
                value: {
                    positionId: '674c1a1b2c3d4e5f6a7b8c8b',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'With Schedule Rule': {
                summary: 'Assign shift with rotating schedule',
                value: {
                    employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    scheduleRuleId: '674c1a1b2c3d4e5f6a7b8d02',
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED',
                    createdBy: '674c1a1b2c3d4e5f6a7b8d03'
                }
            },
            'Permanent Assignment': {
                summary: 'Assign shift permanently (no end date)',
                value: {
                    employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    startDate: '2025-12-01T00:00:00.000Z',
                    status: 'APPROVED'
                }
            },
            'Pending Assignment': {
                summary: 'Create assignment that requires approval',
                value: {
                    employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
                    shiftId: '674c1a1b2c3d4e5f6a7b8d01',
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-01-31T23:59:59.000Z',
                    status: 'PENDING'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Shift assignment(s) created successfully',
        schema: {
            example: {
                message: 'Shift assignment created successfully',
                assignmentId: '674c1a1b2c3d4e5f6a7b8d10',
                employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
                shiftId: '674c1a1b2c3d4e5f6a7b8d01'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid data or missing required fields',
        schema: {
            example: {
                statusCode: 400,
                message: 'At least one target (employeeId, departmentId, or positionId) must be provided',
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Shift, employee, department, or position not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Shift with ID 674c1a1b2c3d4e5f6a7b8d01 not found',
                error: 'Not Found'
            }
        }
    })
    assignShift(@Body() dto: AssignShiftDto) {
        return this.service.assignShiftToEmployee(dto);
    }

    @Post('assignments/bulk')
    @ApiOperation({
        summary: 'Bulk Assign Shift',
        description: 'HR Manager/Admin assigns shifts to multiple employees at once. Can target specific employees, entire departments, or all employees in specific positions.'
    })
    @ApiBody({
        type: BulkAssignShiftDto,
        description: 'Bulk shift assignment data',
        examples: {
            'Assign to Specific Employees': {
                summary: 'Assign shift to 3 specific employees',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { employeeId: '507f1f77bcf86cd799439013' },
                        { employeeId: '507f1f77bcf86cd799439014' },
                        { employeeId: '507f1f77bcf86cd799439015' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Assign to Entire Department': {
                summary: 'Assign shift to all employees in a department',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { departmentId: '507f1f77bcf86cd799439020' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Assign to Multiple Departments': {
                summary: 'Assign shift to Sales and IT departments',
                value: {
                    shiftId: '507f1f77bcf86cd799439012',
                    targets: [
                        { departmentId: '507f1f77bcf86cd799439020' },
                        { departmentId: '507f1f77bcf86cd799439021' }
                    ],
                    startDate: '2025-12-15T00:00:00.000Z',
                    endDate: '2026-06-30T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Assign to Specific Position': {
                summary: 'Assign shift to all managers',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { positionId: '507f1f77bcf86cd799439030' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'Mixed Assignment': {
                summary: 'Assign to employees, departments, and positions combined',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { employeeId: '507f1f77bcf86cd799439013' },
                        { employeeId: '507f1f77bcf86cd799439014' },
                        { departmentId: '507f1f77bcf86cd799439020' },
                        { positionId: '507f1f77bcf86cd799439030' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED'
                }
            },
            'With Schedule Rule': {
                summary: 'Assign shift with rotating schedule',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    scheduleRuleId: '507f1f77bcf86cd799439040',
                    targets: [
                        { departmentId: '507f1f77bcf86cd799439020' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-12-31T23:59:59.000Z',
                    status: 'APPROVED',
                    createdBy: '507f1f77bcf86cd799439050'
                }
            },
            'Permanent Assignment': {
                summary: 'Assign shift permanently (no end date)',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { departmentId: '507f1f77bcf86cd799439020' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    status: 'APPROVED'
                }
            },
            'Pending Assignment': {
                summary: 'Create assignment that requires approval',
                value: {
                    shiftId: '507f1f77bcf86cd799439011',
                    targets: [
                        { employeeId: '507f1f77bcf86cd799439013' }
                    ],
                    startDate: '2025-12-01T00:00:00.000Z',
                    endDate: '2026-01-31T23:59:59.000Z',
                    status: 'PENDING'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Shift assignments created successfully',
        schema: {
            example: {
                message: 'Shift assignments created successfully',
                assignedCount: 15,
                assignmentIds: [
                    '507f1f77bcf86cd799439060',
                    '507f1f77bcf86cd799439061',
                    '507f1f77bcf86cd799439062'
                ]
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid data',
        schema: {
            example: {
                statusCode: 400,
                message: 'Validation failed',
                errors: [
                    'shiftId must be a valid MongoDB ObjectId',
                    'targets must contain at least 1 element'
                ]
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Shift not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Shift with ID 507f1f77bcf86cd799439011 not found'
            }
        }
    })
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

    // @Patch('assignments/:id/status')
    // @ApiOperation({
    //     summary: 'Update Shift Assignment Status',
    //     description: 'HR Manager/Admin updates the status of a shift assignment. Status can be PENDING, APPROVED, CANCELLED, or EXPIRED.'
    // })
    // @ApiParam({
    //     name: 'id',
    //     description: 'Shift Assignment ID (MongoDB ObjectId)',
    //     example: '674c1a1b2c3d4e5f6a7b8d10'
    // })
    // @ApiBody({
    //     type: UpdateShiftAssignmentStatusDto,
    //     description: 'Status update data',
    //     examples: {
    //         'Approve Assignment': {
    //             summary: 'Approve a pending shift assignment',
    //             value: {
    //                 status: 'APPROVED',
    //                 reason: 'Approved by HR Manager after verification',
    //                 updatedBy: '674c1a1b2c3d4e5f6a7b8d03'
    //             }
    //         },
    //         'Cancel Assignment': {
    //             summary: 'Cancel a shift assignment',
    //             value: {
    //                 status: 'CANCELLED',
    //                 reason: 'Employee requested shift change',
    //                 updatedBy: '674c1a1b2c3d4e5f6a7b8d03'
    //             }
    //         },
    //         'Mark as Expired': {
    //             summary: 'Mark assignment as expired',
    //             value: {
    //                 status: 'EXPIRED',
    //                 reason: 'Assignment period has ended'
    //             }
    //         },
    //         'Set to Pending': {
    //             summary: 'Set status back to pending for review',
    //             value: {
    //                 status: 'PENDING',
    //                 reason: 'Requires additional approval'
    //             }
    //         }
    //     }
    // })
    // @ApiResponse({
    //     status: 200,
    //     description: 'Shift assignment status updated successfully',
    //     schema: {
    //         example: {
    //             message: 'Shift assignment status updated successfully',
    //             assignmentId: '674c1a1b2c3d4e5f6a7b8d10',
    //             oldStatus: 'PENDING',
    //             newStatus: 'APPROVED',
    //             updatedAt: '2025-12-01T10:30:00.000Z'
    //         }
    //     }
    // })
    // @ApiResponse({
    //     status: 400,
    //     description: 'Bad request - Invalid status value',
    //     schema: {
    //         example: {
    //             statusCode: 400,
    //             message: 'Invalid status. Must be one of: PENDING, APPROVED, CANCELLED, EXPIRED',
    //             error: 'Bad Request'
    //         }
    //     }
    // })
    // @ApiResponse({
    //     status: 404,
    //     description: 'Shift assignment not found',
    //     schema: {
    //         example: {
    //             statusCode: 404,
    //             message: 'Shift assignment with ID 674c1a1b2c3d4e5f6a7b8d10 not found',
    //             error: 'Not Found'
    //         }
    //     }
    // })
    // updateAssignmentStatus(
    //     @Param('id') id: string,
    //     @Body() dto: UpdateShiftAssignmentStatusDto
    // ) {
    //     return this.service.updateAssignmentStatus(id, dto);
    // }


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
