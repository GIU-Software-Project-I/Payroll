import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrganizationStructureService, DepartmentSearchQuery, PositionSearchQuery, AssignmentSearchQuery, ChangeRequestSearchQuery } from '../services/organization-structure.service';
import { CreateDepartmentDto, UpdateDepartmentDto, CreatePositionDto, UpdatePositionDto, AssignPositionDto, EndAssignmentDto, SubmitStructureRequestDto, UpdateStructureRequestDto, SubmitApprovalDecisionDto } from '../dto/organization-structure';
import { StructureRequestStatus, StructureRequestType } from '../enums/organization-structure.enums';

@Controller('organization-structure')
export class OrganizationStructureController {
    constructor(private readonly orgService: OrganizationStructureService) {}

    @Post('departments')
    createDepartment(@Body() dto: CreateDepartmentDto) {
        return this.orgService.createDepartment(dto);
    }

    @Get('departments')
    getAllDepartments(@Query('isActive') isActive?: string) {
        const active = isActive === undefined ? undefined : isActive === 'true';
        return this.orgService.getAllDepartments(active);
    }

    @Get('departments/search')
    searchDepartments(
        @Query('query') query?: string,
        @Query('isActive') isActive?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const queryDto: DepartmentSearchQuery = {
            query,
            isActive: isActive === undefined ? undefined : isActive === 'true',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        };
        return this.orgService.searchDepartments(queryDto);
    }

    @Get('departments/stats')
    getDepartmentStats() {
        return this.orgService.getDepartmentStats();
    }

    @Get('departments/:id')
    getDepartmentById(@Param('id') id: string) {
        return this.orgService.getDepartmentById(id);
    }

    @Get('departments/:id/hierarchy')
    getDepartmentHierarchy(@Param('id') id: string) {
        return this.orgService.getDepartmentHierarchy(id);
    }

    @Patch('departments/:id')
    updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
        return this.orgService.updateDepartment(id, dto);
    }

    @Patch('departments/:id/deactivate')
    deactivateDepartment(@Param('id') id: string) {
        return this.orgService.deactivateDepartment(id);
    }

    @Patch('departments/:id/reactivate')
    reactivateDepartment(@Param('id') id: string) {
        return this.orgService.reactivateDepartment(id);
    }

    @Post('positions')
    createPosition(@Body() dto: CreatePositionDto) {
        return this.orgService.createPosition(dto);
    }

    @Get('positions')
    getAllPositions(@Query('departmentId') departmentId?: string, @Query('isActive') isActive?: string) {
        const active = isActive === undefined ? undefined : isActive === 'true';
        return this.orgService.getAllPositions(departmentId, active);
    }

    @Get('positions/search')
    searchPositions(
        @Query('query') query?: string,
        @Query('departmentId') departmentId?: string,
        @Query('isActive') isActive?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const queryDto: PositionSearchQuery = {
            query,
            departmentId,
            isActive: isActive === undefined ? undefined : isActive === 'true',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        };
        return this.orgService.searchPositions(queryDto);
    }

    @Get('positions/stats')
    getPositionStats() {
        return this.orgService.getPositionStats();
    }

    @Get('positions/:id')
    getPositionById(@Param('id') id: string) {
        return this.orgService.getPositionById(id);
    }

    @Get('positions/:id/subordinates')
    getPositionSubordinates(@Param('id') id: string) {
        return this.orgService.getPositionSubordinates(id);
    }

    @Patch('positions/:id')
    updatePosition(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
        return this.orgService.updatePosition(id, dto);
    }

    @Patch('positions/:id/deactivate')
    deactivatePosition(@Param('id') id: string, @Body('reason') reason?: string) {
        return this.orgService.deactivatePosition(id, reason);
    }

    @Patch('positions/:id/reactivate')
    reactivatePosition(@Param('id') id: string) {
        return this.orgService.reactivatePosition(id);
    }

    @Post('assignments')
    assignEmployeeToPosition(@Body() dto: AssignPositionDto) {
        return this.orgService.assignEmployeeToPosition(dto);
    }

    @Get('assignments')
    searchAssignments(
        @Query('employeeProfileId') employeeProfileId?: string,
        @Query('positionId') positionId?: string,
        @Query('departmentId') departmentId?: string,
        @Query('activeOnly') activeOnly?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const queryDto: AssignmentSearchQuery = {
            employeeProfileId,
            positionId,
            departmentId,
            activeOnly: activeOnly === 'true',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        };
        return this.orgService.searchAssignments(queryDto);
    }

    @Get('assignments/employee/:employeeProfileId/history')
    getEmployeeAssignmentHistory(@Param('employeeProfileId') employeeProfileId: string) {
        return this.orgService.getEmployeeAssignmentHistory(employeeProfileId);
    }

    @Get('assignments/:id')
    getAssignmentById(@Param('id') id: string) {
        return this.orgService.getAssignmentById(id);
    }

    @Patch('assignments/:id/end')
    endAssignment(@Param('id') id: string, @Body() dto: EndAssignmentDto) {
        return this.orgService.endAssignment(id, dto);
    }

    @Post('change-requests')
    createChangeRequest(@Body() dto: SubmitStructureRequestDto) {
        return this.orgService.createChangeRequest(dto);
    }

    @Get('change-requests')
    searchChangeRequests(
        @Query('status') status?: StructureRequestStatus,
        @Query('requestType') requestType?: StructureRequestType,
        @Query('requestedByEmployeeId') requestedByEmployeeId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const queryDto: ChangeRequestSearchQuery = {
            status,
            requestType,
            requestedByEmployeeId,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        };
        return this.orgService.searchChangeRequests(queryDto);
    }

    @Get('change-requests/count/pending')
    getPendingRequestsCount() {
        return this.orgService.getPendingRequestsCount().then(count => ({ count }));
    }

    @Get('change-requests/by-number/:requestNumber')
    getChangeRequestByNumber(@Param('requestNumber') requestNumber: string) {
        return this.orgService.getChangeRequestByNumber(requestNumber);
    }

    @Get('change-requests/:id')
    getChangeRequestById(@Param('id') id: string) {
        return this.orgService.getChangeRequestById(id);
    }

    @Get('change-requests/:id/approvals')
    getApprovalsByChangeRequest(@Param('id') id: string) {
        return this.orgService.getApprovalsByChangeRequest(id);
    }

    @Patch('change-requests/:id')
    updateChangeRequest(@Param('id') id: string, @Body() dto: UpdateStructureRequestDto) {
        return this.orgService.updateChangeRequest(id, dto);
    }

    @Patch('change-requests/:id/cancel')
    cancelChangeRequest(@Param('id') id: string) {
        return this.orgService.cancelChangeRequest(id);
    }

    @Post('change-requests/:id/approvals')
    submitApprovalDecision(@Param('id') id: string, @Body() dto: SubmitApprovalDecisionDto) {
        return this.orgService.submitApprovalDecision(id, dto);
    }

    @Get('org-chart')
    getOrganizationChart() {
        return this.orgService.getOrganizationChart();
    }

    @Get('change-logs/:entityType/:entityId')
    getChangeLogsByEntity(
        @Param('entityType') entityType: string,
        @Param('entityId') entityId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.orgService.getChangeLogsByEntity(
            entityType,
            entityId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20
        );
    }
}

