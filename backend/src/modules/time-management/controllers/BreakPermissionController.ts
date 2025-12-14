import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {BreakPermissionService} from "../services/BreakPermissionService";
import {ApproveBreakPermissionDto, BreakPermissionDto, RejectBreakPermissionDto} from "../dto/BreakPermissionDto";

@ApiTags('Break Permissions')
@Controller('break-permissions')
export class BreakPermissionController {
    constructor(private readonly breakPermissionService: BreakPermissionService) {}

    @Post()
    @ApiOperation({ summary: 'Create a break permission request' })
    @ApiResponse({ status: 201, description: 'Break permission created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    async createBreakPermission(@Body() dto: BreakPermissionDto) {
        return this.breakPermissionService.createBreakPermission(dto);
    }

    @Post(':permissionId/approve')
    @ApiOperation({ summary: 'Approve a break permission' })
    async approveBreakPermission(
        @Param('permissionId') permissionId: string,
        @Body() dto: ApproveBreakPermissionDto
    ) {
        return this.breakPermissionService.approveBreakPermission(permissionId, dto.approvedBy);
    }

    @Post(':permissionId/reject')
    @ApiOperation({ summary: 'Reject a break permission' })
    async rejectBreakPermission(
        @Param('permissionId') permissionId: string,
        @Body() dto: RejectBreakPermissionDto
    ) {
        return this.breakPermissionService.rejectBreakPermission(permissionId, dto.rejectionReason);
    }

    @Delete(':employeeId/:permissionId')
    @ApiOperation({ summary: 'Delete a break permission' })
    async deleteBreakPermission(
        @Param('employeeId') employeeId: string,
        @Param('permissionId') permissionId: string
    ) {
        return this.breakPermissionService.deleteBreakPermission(employeeId, permissionId);
    }

    @Get('attendance/:attendanceRecordId/approved-minutes')
    @ApiOperation({ summary: 'Get approved break minutes for an attendance record' })
    async getApprovedBreakMinutes(@Param('attendanceRecordId') attendanceRecordId: string) {
        const minutes = await this.breakPermissionService.calculateApprovedBreakMinutes(attendanceRecordId);
        return { attendanceRecordId, approvedBreakMinutes: minutes };
    }
}