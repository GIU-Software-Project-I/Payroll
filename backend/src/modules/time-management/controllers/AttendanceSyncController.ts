import { Controller, Post, Get, Body, Query, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AttendanceSyncService } from '../services/AttendanceSyncService';

@ApiTags('Attendance Sync')
@Controller('attendance-sync')
export class AttendanceSyncController {
    constructor(private readonly syncService: AttendanceSyncService) {}

    @Post('sync-date')
    @ApiOperation({
        summary: 'Manually sync attendance for specific date',
        description: 'Triggers manual sync of attendance records for a specific date to payroll and leave systems'
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['date'],
            properties: {
                date: {
                    type: 'string',
                    example: '2025-12-01',
                    description: 'Date to sync (YYYY-MM-DD)'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Sync completed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid date format' })
    async syncSpecificDate(@Body() dto: { date: string }) {
        const date = new Date(dto.date);
        return this.syncService.syncAttendanceForDate(date);
    }

    @Post('sync-range')
    @ApiOperation({
        summary: 'Manually sync attendance for date range',
        description: 'Triggers manual sync of attendance records for a date range to payroll and leave systems'
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['startDate', 'endDate'],
            properties: {
                startDate: {
                    type: 'string',
                    example: '2025-12-01',
                    description: 'Start date (YYYY-MM-DD)'
                },
                endDate: {
                    type: 'string',
                    example: '2025-12-31',
                    description: 'End date (YYYY-MM-DD)'
                }
            }
        },
        examples: {
            'Month Sync': {
                summary: 'Sync full month',
                value: {
                    startDate: '2025-12-01',
                    endDate: '2025-12-31'
                }
            },
            'Week Sync': {
                summary: 'Sync one week',
                value: {
                    startDate: '2025-12-01',
                    endDate: '2025-12-07'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Range sync completed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    async syncDateRange(@Body() dto: { startDate: string; endDate: string }) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        return this.syncService.syncDateRange(startDate, endDate);
    }

    @Get('conflicts')
    @ApiOperation({
        summary: 'Get sync conflicts',
        description: 'Retrieve attendance/leave sync conflicts that need resolution'
    })
    @ApiQuery({ name: 'employeeId', required: false, description: 'Filter by employee ID' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'resolved', required: false, description: 'Filter by resolved status (true/false)' })
    @ApiResponse({
        status: 200,
        description: 'List of sync conflicts',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    employeeId: { type: 'string' },
                    date: { type: 'string' },
                    conflictType: { type: 'string' },
                    workMinutes: { type: 'number' },
                    leaveType: { type: 'string' },
                    resolved: { type: 'boolean' }
                }
            }
        }
    })
    async getSyncConflicts(
        @Query('employeeId') employeeId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('resolved') resolved?: string,
    ) {
        const filters: any = {};
        if (employeeId) filters.employeeId = employeeId;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        if (resolved !== undefined) filters.resolved = resolved === 'true';

        return this.syncService.getSyncConflicts(filters);
    }

    @Patch('conflicts/:id/resolve')
    @ApiOperation({
        summary: 'Resolve a sync conflict',
        description: 'Resolve attendance/leave conflict by choosing an action'
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['action', 'resolvedBy'],
            properties: {
                action: {
                    type: 'string',
                    enum: ['KEEP_ATTENDANCE', 'KEEP_LEAVE', 'CONVERT_TO_HALF_DAY', 'MANUAL_REVIEW'],
                    description: 'Resolution action'
                },
                note: {
                    type: 'string',
                    description: 'Optional note about resolution'
                },
                resolvedBy: {
                    type: 'string',
                    description: 'ID of user resolving the conflict'
                }
            }
        },
        examples: {
            'Keep Attendance': {
                summary: 'Cancel leave, keep attendance',
                value: {
                    action: 'KEEP_ATTENDANCE',
                    note: 'employee was present, verified by manager',
                    resolvedBy: '674c1a1b2c3d4e5f6a7b8c8a'
                }
            },
            'Keep Leave': {
                summary: 'Invalidate attendance, keep leave',
                value: {
                    action: 'KEEP_LEAVE',
                    note: 'Invalid punch, employee confirmed on leave',
                    resolvedBy: '674c1a1b2c3d4e5f6a7b8c8a'
                }
            },
            'Half Day': {
                summary: 'Convert to half-day leave',
                value: {
                    action: 'CONVERT_TO_HALF_DAY',
                    note: 'employee worked half day',
                    resolvedBy: '674c1a1b2c3d4e5f6a7b8c8a'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Conflict resolved successfully' })
    @ApiResponse({ status: 404, description: 'Conflict not found' })
    async resolveConflict(
        @Param('id') id: string,
        @Body() resolution: {
            action: 'KEEP_ATTENDANCE' | 'KEEP_LEAVE' | 'CONVERT_TO_HALF_DAY' | 'MANUAL_REVIEW';
            note?: string;
            resolvedBy: string;
        }
    ) {
        await this.syncService.resolveConflict(id, resolution);
        return {
            message: 'Conflict resolved successfully',
            conflictId: id,
            action: resolution.action
        };
    }

    @Get('statistics')
    @ApiOperation({
        summary: 'Get sync statistics',
        description: 'Get statistics about attendance sync operations'
    })
    @ApiQuery({ name: 'startDate', required: false, description: 'Statistics start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Statistics end date (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Sync statistics',
        schema: {
            type: 'object',
            properties: {
                period: { type: 'object' },
                totalRecords: { type: 'number' },
                syncedToPayroll: { type: 'number' },
                syncedToLeave: { type: 'number' },
                payrollSyncRate: { type: 'string' },
                leaveSyncRate: { type: 'string' },
                totalConflicts: { type: 'number' },
                unresolvedConflicts: { type: 'number' }
            }
        }
    })
    async getSyncStatistics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.syncService.getSyncStatistics(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
    }
}

