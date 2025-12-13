// // TEMPORARY CONTROLLER WITHOUT AUTHORIZATION - FOR TESTING PURPOSES ONLY
// // Remove this file and uncomment the original controller in production
//
// import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
// import { OrganizationStructureService, DepartmentSearchQuery, PositionSearchQuery, AssignmentSearchQuery, ChangeRequestSearchQuery } from '../services/organization-structure.service';
// import { CreateDepartmentDto, UpdateDepartmentDto, CreatePositionDto, UpdatePositionDto, AssignPositionDto, EndAssignmentDto, SubmitStructureRequestDto, UpdateStructureRequestDto, SubmitApprovalDecisionDto } from '../dto/organization-structure';
// import { StructureRequestStatus, StructureRequestType } from '../enums/organization-structure.enums';
//
// @Controller('organization-structure')
// export class OrganizationStructureNoAuthController {
//     constructor(private readonly orgService: OrganizationStructureService) {}
//
//     // ==========================================
//     // DEPARTMENT ROUTES
//     // ==========================================
//
//     // REQ-OSM-01: Create department
//     @Post('departments')
//     createDepartment(@Body() dto: CreateDepartmentDto) {
//         return this.orgService.createDepartment(dto);
//     }
//
//     // Get all departments
//     @Get('departments')
//     getAllDepartments(@Query('isActive') isActive?: string) {
//         const active = isActive === undefined ? undefined : isActive === 'true';
//         return this.orgService.getAllDepartments(active);
//     }
//
//     // Search departments
//     @Get('departments/search')
//     searchDepartments(
//         @Query('query') query?: string,
//         @Query('isActive') isActive?: string,
//         @Query('page') page?: string,
//         @Query('limit') limit?: string
//     ) {
//         const queryDto: DepartmentSearchQuery = {
//             query,
//             isActive: isActive === undefined ? undefined : isActive === 'true',
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//         };
//         return this.orgService.searchDepartments(queryDto);
//     }
//
//     // Get department statistics
//     @Get('departments/stats')
//     getDepartmentStats() {
//         return this.orgService.getDepartmentStats();
//     }
//
//     // Get department by ID
//     @Get('departments/:id')
//     getDepartmentById(@Param('id') id: string) {
//         return this.orgService.getDepartmentById(id);
//     }
//
//     // Get department hierarchy
//     @Get('departments/:id/hierarchy')
//     getDepartmentHierarchy(@Param('id') id: string) {
//         return this.orgService.getDepartmentHierarchy(id);
//     }
//
//     // REQ-OSM-02: Update department
//     @Patch('departments/:id')
//     updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
//         return this.orgService.updateDepartment(id, dto);
//     }
//
//     // REQ-OSM-05: Deactivate department
//     @Patch('departments/:id/deactivate')
//     deactivateDepartment(@Param('id') id: string) {
//         return this.orgService.deactivateDepartment(id);
//     }
//
//     // Reactivate department
//     @Patch('departments/:id/reactivate')
//     reactivateDepartment(@Param('id') id: string) {
//         return this.orgService.reactivateDepartment(id);
//     }
//
//     // ==========================================
//     // POSITION ROUTES
//     // ==========================================
//
//     // REQ-OSM-01: Create position
//     @Post('positions')
//     createPosition(@Body() dto: CreatePositionDto) {
//         return this.orgService.createPosition(dto);
//     }
//
//     // Get all positions
//     @Get('positions')
//     getAllPositions(@Query('departmentId') departmentId?: string, @Query('isActive') isActive?: string) {
//         const active = isActive === undefined ? undefined : isActive === 'true';
//         return this.orgService.getAllPositions(departmentId, active);
//     }
//
//     // Search positions
//     @Get('positions/search')
//     searchPositions(
//         @Query('query') query?: string,
//         @Query('departmentId') departmentId?: string,
//         @Query('isActive') isActive?: string,
//         @Query('page') page?: string,
//         @Query('limit') limit?: string
//     ) {
//         const queryDto: PositionSearchQuery = {
//             query,
//             departmentId,
//             isActive: isActive === undefined ? undefined : isActive === 'true',
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//         };
//         return this.orgService.searchPositions(queryDto);
//     }
//
//     // Get position statistics
//     @Get('positions/stats')
//     getPositionStats() {
//         return this.orgService.getPositionStats();
//     }
//
//     // Get position by ID
//     @Get('positions/:id')
//     getPositionById(@Param('id') id: string) {
//         return this.orgService.getPositionById(id);
//     }
//
//     // Get position subordinates
//     @Get('positions/:id/subordinates')
//     getPositionSubordinates(@Param('id') id: string) {
//         return this.orgService.getPositionSubordinates(id);
//     }
//
//     // REQ-OSM-02: Update position
//     @Patch('positions/:id')
//     updatePosition(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
//         return this.orgService.updatePosition(id, dto);
//     }
//
//     // REQ-OSM-05: Deactivate position (with delimit logic)
//     @Patch('positions/:id/deactivate')
//     deactivatePosition(@Param('id') id: string, @Body('reason') reason?: string) {
//         return this.orgService.deactivatePosition(id, reason);
//     }
//
//     // Reactivate position
//     @Patch('positions/:id/reactivate')
//     reactivatePosition(@Param('id') id: string) {
//         return this.orgService.reactivatePosition(id);
//     }
//
//     // ==========================================
//     // POSITION ASSIGNMENT ROUTES
//     // ==========================================
//
//     // Assign employee to position
//     @Post('assignments')
//     assignEmployeeToPosition(@Body() dto: AssignPositionDto) {
//         return this.orgService.assignEmployeeToPosition(dto);
//     }
//
//     // Search assignments
//     @Get('assignments')
//     searchAssignments(
//         @Query('employeeProfileId') employeeProfileId?: string,
//         @Query('positionId') positionId?: string,
//         @Query('departmentId') departmentId?: string,
//         @Query('activeOnly') activeOnly?: string,
//         @Query('page') page?: string,
//         @Query('limit') limit?: string
//     ) {
//         const queryDto: AssignmentSearchQuery = {
//             employeeProfileId,
//             positionId,
//             departmentId,
//             activeOnly: activeOnly === 'true',
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//         };
//         return this.orgService.searchAssignments(queryDto);
//     }
//
//     // Get employee assignment history
//     @Get('assignments/employee/:employeeProfileId/history')
//     getEmployeeAssignmentHistory(@Param('employeeProfileId') employeeProfileId: string) {
//         return this.orgService.getEmployeeAssignmentHistory(employeeProfileId);
//     }
//
//     // Get assignment by ID
//     @Get('assignments/:id')
//     getAssignmentById(@Param('id') id: string) {
//         return this.orgService.getAssignmentById(id);
//     }
//
//     // End assignment (delimit)
//     @Patch('assignments/:id/end')
//     endAssignment(@Param('id') id: string, @Body() dto: EndAssignmentDto) {
//         return this.orgService.endAssignment(id, dto);
//     }
//
//     // ==========================================
//     // CHANGE REQUEST ROUTES (REQ-OSM-03, REQ-OSM-04)
//     // ==========================================
//
//     // REQ-OSM-03: Manager submits change request
//     @Post('change-requests')
//     createChangeRequest(@Body() dto: SubmitStructureRequestDto, @Query('userId') userId?: string) {
//         return this.orgService.createChangeRequest({ ...dto, requestedByEmployeeId: userId || dto.requestedByEmployeeId });
//     }
//
//     // REQ-OSM-04: Get all change requests
//     @Get('change-requests')
//     searchChangeRequests(
//         @Query('status') status?: StructureRequestStatus,
//         @Query('requestType') requestType?: StructureRequestType,
//         @Query('requestedByEmployeeId') requestedByEmployeeId?: string,
//         @Query('page') page?: string,
//         @Query('limit') limit?: string
//     ) {
//         const queryDto: ChangeRequestSearchQuery = {
//             status,
//             requestType,
//             requestedByEmployeeId,
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//         };
//         return this.orgService.searchChangeRequests(queryDto);
//     }
//
//     // Get pending requests count
//     @Get('change-requests/count/pending')
//     getPendingRequestsCount() {
//         return this.orgService.getPendingRequestsCount().then(count => ({ count }));
//     }
//
//     // Get change request by number
//     @Get('change-requests/by-number/:requestNumber')
//     getChangeRequestByNumber(@Param('requestNumber') requestNumber: string) {
//         return this.orgService.getChangeRequestByNumber(requestNumber);
//     }
//
//     // Get change request by ID
//     @Get('change-requests/:id')
//     getChangeRequestById(@Param('id') id: string) {
//         return this.orgService.getChangeRequestById(id);
//     }
//
//     // Get approvals for change request
//     @Get('change-requests/:id/approvals')
//     getApprovalsByChangeRequest(@Param('id') id: string) {
//         return this.orgService.getApprovalsByChangeRequest(id);
//     }
//
//     // REQ-OSM-04: Update change request
//     @Patch('change-requests/:id')
//     updateChangeRequest(@Param('id') id: string, @Body() dto: UpdateStructureRequestDto) {
//         return this.orgService.updateChangeRequest(id, dto);
//     }
//
//     // Cancel change request
//     @Patch('change-requests/:id/cancel')
//     cancelChangeRequest(@Param('id') id: string) {
//         return this.orgService.cancelChangeRequest(id);
//     }
//
//     // REQ-OSM-04: Submit approval decision
//     @Post('change-requests/:id/approvals')
//     submitApprovalDecision(@Param('id') id: string, @Body() dto: SubmitApprovalDecisionDto, @Query('userId') userId?: string) {
//         return this.orgService.submitApprovalDecision(id, { ...dto, approverEmployeeId: userId || dto.approverEmployeeId });
//     }
//
//     // ==========================================
//     // ORGANIZATION CHART & VIEWS (REQ-SANV-01, REQ-SANV-02)
//     // ==========================================
//
//     // REQ-SANV-01: Get organization chart
//     @Get('org-chart')
//     getOrganizationChart() {
//         return this.orgService.getOrganizationChart();
//     }
//
//     // ==========================================
//     // CHANGE LOG ROUTES
//     // ==========================================
//
//     // Get change logs by entity
//     @Get('change-logs/:entityType/:entityId')
//     getChangeLogsByEntity(
//         @Param('entityType') entityType: string,
//         @Param('entityId') entityId: string,
//         @Query('page') page?: string,
//         @Query('limit') limit?: string
//     ) {
//         return this.orgService.getChangeLogsByEntity(
//             entityType,
//             entityId,
//             page ? parseInt(page, 10) : 1,
//             limit ? parseInt(limit, 10) : 20
//         );
//     }
// }
//
