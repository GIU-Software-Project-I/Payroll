// // TEMPORARY CONTROLLER WITHOUT AUTHORIZATION - FOR TESTING PURPOSES ONLY
// // Remove this file and uncomment the original controller in production
//
// import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
// import { PerformanceService, TemplateSearchQuery, CycleSearchQuery, AssignmentSearchQuery, RecordSearchQuery, DisputeSearchQuery } from '../services/performance.service';
// import { CreateAppraisalTemplateDto, UpdateAppraisalTemplateDto } from '../dto/performance/appraisal-template.dto';
// import { CreateAppraisalCycleDto, UpdateAppraisalCycleDto } from '../dto/performance/appraisal-cycle.dto';
// import { BulkCreateAppraisalAssignmentDto, CreateAppraisalAssignmentDto } from '../dto/performance/appraisal-assignment.dto';
// import { SubmitAppraisalRecordDto } from '../dto/performance/appraisal-record.dto';
// import { FileAppraisalDisputeDto, ResolveAppraisalDisputeDto } from '../dto/performance/appraisal-dispute.dto';
// import { AppraisalTemplateType, AppraisalCycleStatus, AppraisalAssignmentStatus, AppraisalRecordStatus, AppraisalDisputeStatus } from '../enums/performance.enums';
//
// @Controller('performance')
// export class PerformanceNoAuthController {
//     constructor(private performanceService: PerformanceService) {}
//
//     // ==================== TEMPLATES ====================
//     // REQ-PP-01: HR Manager configures standardized appraisal templates
//
//     @Post('templates')
//     @HttpCode(HttpStatus.CREATED)
//     async createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
//         return this.performanceService.createTemplate(dto);
//     }
//
//     @Get('templates')
//     async getAllTemplates(@Query('isActive') isActive?: string) {
//         const active = isActive === undefined ? undefined : isActive === 'true';
//         return this.performanceService.getAllTemplates(active);
//     }
//
//     @Get('templates/search')
//     async searchTemplates(
//         @Query('page') page?: string,
//         @Query('limit') limit?: string,
//         @Query('query') query?: string,
//         @Query('templateType') templateType?: AppraisalTemplateType,
//         @Query('isActive') isActive?: string,
//     ) {
//         const queryDto: TemplateSearchQuery = {
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//             query,
//             templateType,
//             isActive: isActive === undefined ? undefined : isActive === 'true',
//         };
//         return this.performanceService.searchTemplates(queryDto);
//     }
//
//     @Get('templates/stats')
//     async getTemplateStats() {
//         return this.performanceService.getTemplateStats();
//     }
//
//     @Get('templates/:id')
//     async getTemplateById(@Param('id') id: string) {
//         return this.performanceService.getTemplateById(id);
//     }
//
//     @Patch('templates/:id')
//     async updateTemplate(@Param('id') id: string, @Body() dto: UpdateAppraisalTemplateDto) {
//         return this.performanceService.updateTemplate(id, dto);
//     }
//
//     @Patch('templates/:id/deactivate')
//     async deactivateTemplate(@Param('id') id: string) {
//         return this.performanceService.deactivateTemplate(id);
//     }
//
//     @Patch('templates/:id/reactivate')
//     async reactivateTemplate(@Param('id') id: string) {
//         return this.performanceService.reactivateTemplate(id);
//     }
//
//     // ==================== CYCLES ====================
//     // REQ-PP-02: Define and schedule appraisal cycles
//
//     @Post('cycles')
//     @HttpCode(HttpStatus.CREATED)
//     async createCycle(@Body() dto: CreateAppraisalCycleDto) {
//         return this.performanceService.createCycle(dto);
//     }
//
//     @Get('cycles')
//     async getAllCycles(@Query('status') status?: AppraisalCycleStatus) {
//         return this.performanceService.getAllCycles(status);
//     }
//
//     @Get('cycles/search')
//     async searchCycles(
//         @Query('page') page?: string,
//         @Query('limit') limit?: string,
//         @Query('query') query?: string,
//         @Query('status') status?: AppraisalCycleStatus,
//         @Query('cycleType') cycleType?: AppraisalTemplateType,
//     ) {
//         const queryDto: CycleSearchQuery = {
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//             query,
//             status,
//             cycleType,
//         };
//         return this.performanceService.searchCycles(queryDto);
//     }
//
//     @Get('cycles/stats')
//     async getCycleStats() {
//         return this.performanceService.getCycleStats();
//     }
//
//     @Get('cycles/:id')
//     async getCycleById(@Param('id') id: string) {
//         return this.performanceService.getCycleById(id);
//     }
//
//     @Patch('cycles/:id')
//     async updateCycle(@Param('id') id: string, @Body() dto: UpdateAppraisalCycleDto) {
//         return this.performanceService.updateCycle(id, dto);
//     }
//
//     @Post('cycles/:id/activate')
//     @HttpCode(HttpStatus.OK)
//     async activateCycle(@Param('id') id: string) {
//         return this.performanceService.activateCycle(id);
//     }
//
//     @Post('cycles/:id/close')
//     @HttpCode(HttpStatus.OK)
//     async closeCycle(@Param('id') id: string) {
//         return this.performanceService.closeCycle(id);
//     }
//
//     @Post('cycles/:id/archive')
//     @HttpCode(HttpStatus.OK)
//     async archiveCycle(@Param('id') id: string) {
//         return this.performanceService.archiveCycle(id);
//     }
//
//     // ==================== ASSIGNMENTS ====================
//     // REQ-PP-05: Assign appraisal forms to employees and managers
//     // REQ-PP-13: Line manager views assigned appraisal forms
//
//     @Post('assignments')
//     @HttpCode(HttpStatus.CREATED)
//     async createAssignment(@Body() dto: CreateAppraisalAssignmentDto) {
//         return this.performanceService.createAssignment(dto);
//     }
//
//     @Post('assignments/bulk')
//     @HttpCode(HttpStatus.CREATED)
//     async bulkCreateAssignments(@Body() dto: BulkCreateAppraisalAssignmentDto) {
//         return this.performanceService.bulkCreateAssignments(dto);
//     }
//
//     @Get('assignments')
//     async searchAssignments(
//         @Query('page') page?: string,
//         @Query('limit') limit?: string,
//         @Query('cycleId') cycleId?: string,
//         @Query('employeeProfileId') employeeProfileId?: string,
//         @Query('managerProfileId') managerProfileId?: string,
//         @Query('departmentId') departmentId?: string,
//         @Query('status') status?: AppraisalAssignmentStatus,
//     ) {
//         const queryDto: AssignmentSearchQuery = {
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//             cycleId,
//             employeeProfileId,
//             managerProfileId,
//             departmentId,
//             status,
//         };
//         return this.performanceService.searchAssignments(queryDto);
//     }
//
//     @Get('assignments/manager/:managerProfileId')
//     async getAssignmentsForManager(@Param('managerProfileId') managerProfileId: string) {
//         return this.performanceService.getAssignmentsForManager(managerProfileId);
//     }
//
//     @Get('assignments/employee/:employeeProfileId')
//     async getAssignmentsForEmployee(@Param('employeeProfileId') employeeProfileId: string) {
//         return this.performanceService.getAssignmentsForEmployee(employeeProfileId);
//     }
//
//     @Get('assignments/:id')
//     async getAssignmentById(@Param('id') id: string) {
//         return this.performanceService.getAssignmentById(id);
//     }
//
//     // ==================== RECORDS ====================
//     // REQ-AE-03: Line Manager completes structured appraisal ratings
//     // REQ-AE-04: Add comments and development recommendations
//
//     @Post('records')
//     @HttpCode(HttpStatus.CREATED)
//     async submitAppraisalRecord(@Body() dto: SubmitAppraisalRecordDto) {
//         return this.performanceService.submitAppraisalRecord(dto);
//     }
//
//     @Post('records/draft')
//     @HttpCode(HttpStatus.CREATED)
//     async saveDraftRecord(@Body() dto: SubmitAppraisalRecordDto) {
//         return this.performanceService.saveDraftRecord(dto);
//     }
//
//     @Get('records')
//     async searchRecords(
//         @Query('page') page?: string,
//         @Query('limit') limit?: string,
//         @Query('cycleId') cycleId?: string,
//         @Query('employeeProfileId') employeeProfileId?: string,
//         @Query('managerProfileId') managerProfileId?: string,
//         @Query('status') status?: AppraisalRecordStatus,
//     ) {
//         const queryDto: RecordSearchQuery = {
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//             cycleId,
//             employeeProfileId,
//             managerProfileId,
//             status,
//         };
//         return this.performanceService.searchRecords(queryDto);
//     }
//
//     @Get('records/assignment/:assignmentId')
//     async getRecordByAssignment(@Param('assignmentId') assignmentId: string) {
//         return this.performanceService.getRecordByAssignment(assignmentId);
//     }
//
//     @Get('records/:id')
//     async getRecordById(@Param('id') id: string) {
//         return this.performanceService.getRecordById(id);
//     }
//
//     // REQ-AE-10, REQ-AE-06: HR monitors and publishes
//     @Post('records/:id/publish')
//     @HttpCode(HttpStatus.OK)
//     async publishRecord(@Param('id') id: string, @Query('publisherId') publisherId?: string) {
//         return this.performanceService.publishRecord(id, publisherId ?? '');
//     }
//
//     @Post('records/bulk-publish')
//     @HttpCode(HttpStatus.OK)
//     async bulkPublishRecords(@Body() body: { recordIds: string[] }, @Query('publisherId') publisherId?: string) {
//         return this.performanceService.bulkPublishRecords(body.recordIds, publisherId ?? '');
//     }
//
//     // REQ-OD-01: Employee views and acknowledges
//     @Post('records/:id/acknowledge')
//     @HttpCode(HttpStatus.OK)
//     async acknowledgeRecord(@Param('id') id: string, @Body() body?: { comment?: string }) {
//         return this.performanceService.acknowledgeRecord(id, body?.comment);
//     }
//
//     @Post('records/:id/view')
//     @HttpCode(HttpStatus.OK)
//     async markRecordViewed(@Param('id') id: string) {
//         return this.performanceService.markRecordViewed(id);
//     }
//
//     // REQ-OD-08: Access past appraisal history
//     @Get('employee/:employeeProfileId/history')
//     async getEmployeeAppraisalHistory(@Param('employeeProfileId') employeeProfileId: string) {
//         return this.performanceService.getEmployeeAppraisalHistory(employeeProfileId);
//     }
//
//     // ==================== DISPUTES ====================
//     // REQ-AE-07: Employee flags concern about rating
//     // REQ-OD-07: HR Manager resolves disputes
//
//     @Post('disputes')
//     @HttpCode(HttpStatus.CREATED)
//     async fileDispute(@Body() dto: FileAppraisalDisputeDto) {
//         return this.performanceService.fileDispute(dto);
//     }
//
//     @Get('disputes')
//     async searchDisputes(
//         @Query('page') page?: string,
//         @Query('limit') limit?: string,
//         @Query('cycleId') cycleId?: string,
//         @Query('status') status?: AppraisalDisputeStatus,
//         @Query('raisedByEmployeeId') raisedByEmployeeId?: string,
//     ) {
//         const queryDto: DisputeSearchQuery = {
//             page: page ? parseInt(page, 10) : 1,
//             limit: limit ? parseInt(limit, 10) : 20,
//             cycleId,
//             status,
//             raisedByEmployeeId,
//         };
//         return this.performanceService.searchDisputes(queryDto);
//     }
//
//     @Get('disputes/stats')
//     async getDisputeStats(@Query('cycleId') cycleId?: string) {
//         return this.performanceService.getDisputeStats(cycleId);
//     }
//
//     @Get('disputes/:id')
//     async getDisputeById(@Param('id') id: string) {
//         return this.performanceService.getDisputeById(id);
//     }
//
//     @Patch('disputes/:id/assign-reviewer')
//     async assignDisputeReviewer(@Param('id') id: string, @Body() body: { reviewerEmployeeId: string }) {
//         return this.performanceService.assignDisputeReviewer(id, body.reviewerEmployeeId);
//     }
//
//     @Patch('disputes/:id/resolve')
//     async resolveDispute(@Param('id') id: string, @Body() dto: ResolveAppraisalDisputeDto, @Query('resolverId') resolverId?: string) {
//         return this.performanceService.resolveDispute({ ...dto, disputeId: id, resolvedByEmployeeId: resolverId ?? '' });
//     }
//
//     // ==================== DASHBOARD ====================
//     // REQ-AE-10: Consolidated dashboard tracks appraisal completion
//
//     @Get('dashboard/:cycleId')
//     async getCompletionDashboard(@Param('cycleId') cycleId: string) {
//         return this.performanceService.getCompletionDashboard(cycleId);
//     }
// }
