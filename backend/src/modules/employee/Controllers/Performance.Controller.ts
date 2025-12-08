import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';


import {CreateAppraisalTemplateDto, UpdateAppraisalTemplateDto} from "../dto/performance/appraisal-template.dto";
import {CreateAppraisalCycleDto, UpdateAppraisalCycleDto} from "../dto/performance/appraisal-cycle.dto";
import {
    BulkCreateAppraisalAssignmentDto,
    CreateAppraisalAssignmentDto
} from "../dto/performance/appraisal-assignment.dto";
import {SubmitAppraisalRecordDto} from "../dto/performance/appraisal-record.dto";
import {FileAppraisalDisputeDto, ResolveAppraisalDisputeDto} from "../dto/performance/appraisal-dispute.dto";
import {PerformanceService} from "../Services/Performance.Service";



@Controller('performance')
export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  // ============ PHASE 1: TEMPLATES ============

  /**
   * POST /performance/templates
   * REQ-PP-01: Create a standardized appraisal template
   */
  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  /**
   * PATCH /performance/templates/:templateId
   * Update an appraisal template
   */
  @Patch('templates/:templateId')
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(templateId, dto);
  }

  /**
   * GET /performance/templates/:templateId
   * Get template by ID
   */
  @Get('templates/:templateId')
  async getTemplate(@Param('templateId') templateId: string) {
    return this.performanceService.getTemplate(templateId);
  }

  /**
   * GET /performance/templates
   * Get all templates (default: active only)
   */
  @Get('templates')
  async getAllTemplates(@Query('isActive') isActive?: string) {
    const filter = isActive === 'false' ? {} : { isActive: true };
    return this.performanceService.getAllTemplates(filter);
  }

  // ============ PHASE 2: CYCLES ============

  /**
   * POST /performance/cycles
   * REQ-PP-02: Create and schedule an appraisal cycle
   */
  @Post('cycles')
  @HttpCode(HttpStatus.CREATED)
  async createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  /**
   * PATCH /performance/cycles/:cycleId
   * Update an appraisal cycle
   */
  @Patch('cycles/:cycleId')
  async updateCycle(
    @Param('cycleId') cycleId: string,
    @Body() dto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(cycleId, dto);
  }

  /**
   * GET /performance/cycles/:cycleId
   * Get cycle by ID
   */
  @Get('cycles/:cycleId')
  async getCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.getCycle(cycleId);
  }

  /**
   * GET /performance/cycles
   * Get all cycles with optional filtering
   */
  @Get('cycles')
  async getAllCycles(@Query('status') status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.performanceService.getAllCycles(filter);
  }

  /**
   * POST /performance/cycles/:cycleId/activate
   * Activate a PLANNED cycle (transition to ACTIVE)
   */
  @Post('cycles/:cycleId/activate')
  @HttpCode(HttpStatus.OK)
  async activateCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.activateCycle(cycleId);
  }

  /**
   * POST /performance/cycles/:cycleId/close
   * Close an ACTIVE cycle (transition to CLOSED)
   */
  @Post('cycles/:cycleId/close')
  @HttpCode(HttpStatus.OK)
  async closeCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.closeCycle(cycleId);
  }

  /**
   * POST /performance/cycles/:cycleId/archive
   * Manually archive a CLOSED cycle
   */
  @Post('cycles/:cycleId/archive')
  @HttpCode(HttpStatus.OK)
  async archiveCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.archiveCycle(cycleId);
  }

  /**
   * GET /performance/cycles/archived
   * Get all archived cycles
   */
  @Get('cycles-archived')
  async getArchivedCycles() {
    return this.performanceService.getArchivedCycles();
  }

  // ============ PHASE 3A: ASSIGNMENTS ============

  /**
   * POST /performance/assignments
   * REQ-PP-05: Create a single appraisal assignment
   */
  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  async createAssignment(@Body() dto: CreateAppraisalAssignmentDto) {
    return this.performanceService.createAssignment(dto);
  }

  /**
   * POST /performance/assignments/bulk
   * REQ-PP-05: Bulk create assignments for multiple employees
   */
  @Post('assignments/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateAssignments(
    @Body() dto: BulkCreateAppraisalAssignmentDto,
  ) {
    return this.performanceService.bulkCreateAssignments(dto);
  }

  /**
   * GET /performance/assignments/:assignmentId
   * Get assignment by ID
   */
  @Get('assignments/:assignmentId')
  async getAssignment(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.getAssignment(assignmentId);
  }

  /**
   * GET /performance/assignments
   * Get all assignments with optional filtering
   */
  @Get('assignments')
  async getAllAssignments(
    @Query('cycleId') cycleId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;
    if (departmentId) filter.departmentId = departmentId;
    return this.performanceService.getAllAssignments(filter);
  }

  /**
   * GET /performance/assignments/manager/:managerProfileId
   * REQ-PP-13: Get assignments for a specific manager
   */
  @Get('assignments/manager/:managerProfileId')
  async getAssignmentsForManager(
    @Param('managerProfileId') managerProfileId: string,
  ) {
    return this.performanceService.getAssignmentsForManager(managerProfileId);
  }

  // ============ PHASE 3B & PHASE 4: RECORDS ============

  /**
   * POST /performance/records
   * REQ-AE-03 & REQ-AE-04: Submit appraisal record with ratings and comments
   */
  @Post('records')
  @HttpCode(HttpStatus.CREATED)
  async submitAppraisalRecord(@Body() dto: SubmitAppraisalRecordDto) {
    return this.performanceService.submitAppraisalRecord(dto);
  }

  /**
   * GET /performance/records/:recordId
   * Get appraisal record by ID
   */
  @Get('records/:recordId')
  async getAppraisalRecord(@Param('recordId') recordId: string) {
    return this.performanceService.getAppraisalRecord(recordId);
  }

  /**
   * GET /performance/records/cycle/:cycleId
   * Get appraisal records for a specific cycle
   */
  @Get('records/cycle/:cycleId')
  async getRecordsByCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.getRecordsByCycle(cycleId);
  }

  /**
   * POST /performance/records/:recordId/publish
   * REQ-AE-06: Publish appraisal record to employee
   */
  @Post('records/:recordId/publish')
  @HttpCode(HttpStatus.OK)
  async publishAppraisalRecord(
    @Param('recordId') recordId: string,
    @Body() body: { publishedByEmployeeId: string },
  ) {
    return this.performanceService.publishAppraisalRecord(
      recordId,
      body.publishedByEmployeeId,
    );
  }

  /**
   * GET /performance/dashboard/:cycleId
   * REQ-AE-10: Get completion dashboard for a cycle
   */
  @Get('dashboard/:cycleId')
  async getCompletionDashboard(@Param('cycleId') cycleId: string) {
    return this.performanceService.getCompletionDashboard(cycleId);
  }

  /**
   * GET /performance/pending-manager/:managerProfileId
   * REQ-AE-06: Get pending appraisals for a manager
   */
  @Get('pending-manager/:managerProfileId')
  async getPendingAppraisesByManager(
    @Param('managerProfileId') managerProfileId: string,
  ) {
    return this.performanceService.getPendingAppraisesByManager(
      managerProfileId,
    );
  }

  // ============ PHASE 5: EMPLOYEE ACKNOWLEDGEMENT ============

  /**
   * POST /performance/records/:recordId/acknowledge
   * REQ-OD-01: Employee acknowledges appraisal record
   */
  @Post('records/:recordId/acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledgeAppraisal(
    @Param('recordId') recordId: string,
    @Body() body?: { acknowledgementComment?: string },
  ) {
    return this.performanceService.acknowledgeAppraisal(
      recordId,
      body?.acknowledgementComment,
    );
  }

  /**
   * GET /performance/employee/:employeeProfileId/history
   * Get historical appraisal records for an employee
   */
  @Get('employee/:employeeProfileId/history')
  async getEmployeeAppraisalHistory(
    @Param('employeeProfileId') employeeProfileId: string,
  ) {
    return this.performanceService.getEmployeeAppraisalHistory(
      employeeProfileId,
    );
  }

  // ============ PHASE 6 & 7: DISPUTES ============

  /**
   * POST /performance/disputes
   * REQ-AE-07: Employee files a dispute/objection
   */
  @Post('disputes')
  @HttpCode(HttpStatus.CREATED)
  async fileDispute(@Body() dto: FileAppraisalDisputeDto) {
    return this.performanceService.fileDispute(dto);
  }

  /**
   * GET /performance/disputes/:disputeId
   * Get dispute by ID
   */
  @Get('disputes/:disputeId')
  async getDispute(@Param('disputeId') disputeId: string) {
    return this.performanceService.getDispute(disputeId);
  }

  /**
   * GET /performance/disputes/cycle/:cycleId
   * Get all disputes for a cycle
   */
  @Get('disputes/cycle/:cycleId')
  async getDisputesByCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.getDisputesByCycle(cycleId);
  }

  /**
   * PATCH /performance/disputes/:disputeId/resolve
   * REQ-OD-07: HR Manager resolves a dispute
   */
  @Patch('disputes/:disputeId/resolve')
  async resolveDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveAppraisalDisputeDto,
  ) {
    return this.performanceService.resolveDispute({
      ...dto,
      disputeId,
    });
  }
}
