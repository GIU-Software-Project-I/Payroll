import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';
import {CreateOnboardingDto, CreateOnboardingTaskDto, UpdateTaskStatusDto, UploadDocumentDto, ReserveEquipmentDto, ProvisionAccessDto, TriggerPayrollInitiationDto, ScheduleAccessRevocationDto, CancelOnboardingDto,} from '../dto/onboarding';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

    // ============================================================
    // Candidate Document Upload - Initiate Onboarding
    // ============================================================

    @Post('upload-contract')
    @ApiOperation({
        summary: 'Candidate upload signed contract and forms',
        description: 'As a Candidate, I want to upload signed contract and candidate required forms and templates to initiate the onboarding process.',
    })
    @ApiBody({ type: UploadDocumentDto })
    @ApiResponse({ status: 201, description: 'Contract and forms uploaded successfully' })
    async uploadContractAndForms(@Body() dto: UploadDocumentDto) {
        return this.onboardingService.uploadDocument(dto);
    }

    // ============================================================
    // ONB-001: Create Onboarding Task Checklists
    // ============================================================

    @Post()
    @ApiOperation({
        summary: 'ONB-001: Create onboarding checklist',
        description: 'HR Manager creates onboarding task checklists for new hires. BR 8, 11: Customizable checklists with department-specific tasks.',
    })
    @ApiBody({ type: CreateOnboardingDto })
    @ApiResponse({ status: 201, description: 'Onboarding checklist created successfully' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @ApiResponse({ status: 409, description: 'Onboarding checklist already exists' })
    async createOnboarding(@Body() dto: CreateOnboardingDto) {
        return this.onboardingService.createOnboarding(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all onboarding checklists',
        description: 'HR Manager views all onboarding checklists',
    })
    @ApiResponse({ status: 200, description: 'List of onboarding checklists' })
    async getAllOnboardings() {
        return this.onboardingService.getAllOnboardings();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get onboarding by ID',
        description: 'Retrieve specific onboarding checklist with full details',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiResponse({ status: 200, description: 'Onboarding details' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    async getOnboardingById(@Param('id') id: string) {
        return this.onboardingService.getOnboardingById(id);
    }

    @Post(':id/tasks')
    @ApiOperation({
        summary: 'Add task to onboarding checklist',
        description: 'Add a new task to existing onboarding checklist',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiBody({ type: CreateOnboardingTaskDto })
    @ApiResponse({ status: 200, description: 'Task added successfully' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    async addTask(
        @Param('id') id: string,
        @Body() dto: CreateOnboardingTaskDto,
    ) {
        return this.onboardingService.addTask(id, dto);
    }

    // ============================================================
    // ONB-002: Access Signed Contract Details
    // ============================================================

    @Get('contracts/:contractId')
    @ApiOperation({
        summary: 'ONB-002: Get signed contract details',
        description: 'HR Manager accesses signed contract detail to create employee profile. BR 17(a, b): Uses contract data from Recruitment.',
    })
    @ApiParam({ name: 'contractId', description: 'Contract ID' })
    @ApiResponse({ status: 200, description: 'Contract details' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @ApiResponse({ status: 400, description: 'Contract not fully signed' })
    async getContractDetails(@Param('contractId') contractId: string) {
        return this.onboardingService.getContractDetails(contractId);
    }

    @Post('contracts/:contractId/create-employee')
    @ApiOperation({
        summary: 'ONB-002: Create employee profile from signed contract',
        description: 'HR Manager creates employee profile from signed contract details. BR 17(a, b): Extracts role, salary, benefits from contract.',
    })
    @ApiParam({ name: 'contractId', description: 'Contract ID' })
    @ApiResponse({ status: 201, description: 'Employee profile created successfully with temporary password' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @ApiResponse({ status: 400, description: 'Contract not fully signed or employee already exists' })
    async createEmployeeFromContract(@Param('contractId') contractId: string) {
        return this.onboardingService.createEmployeeFromContract(contractId);
    }

    // ============================================================
    // ONB-004: View Onboarding Steps (Tracker)
    // ============================================================

    @Get('employee/:employeeId')
    @ApiOperation({
        summary: 'ONB-004: View onboarding tracker',
        description: 'New Hire views their onboarding steps in a tracker. BR 11(a, b): Workflow with department-specific tasks.',
    })
    @ApiParam({ name: 'employeeId', description: 'employee ID' })
    @ApiResponse({ status: 200, description: 'Onboarding tracker details' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
        return this.onboardingService.getOnboardingByEmployeeId(employeeId);
    }

    @Get(':id/progress')
    @ApiOperation({
        summary: 'Get onboarding progress',
        description: 'View progress statistics for onboarding checklist',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiResponse({ status: 200, description: 'Progress statistics' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    async getOnboardingProgress(@Param('id') id: string) {
        return this.onboardingService.getOnboardingProgress(id);
    }

    @Patch(':id/tasks/:taskName/status')
    @ApiOperation({
        summary: 'Update task status',
        description: 'Update status of individual onboarding task',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiParam({ name: 'taskName', description: 'Task name' })
    @ApiBody({ type: UpdateTaskStatusDto })
    @ApiResponse({ status: 200, description: 'Task status updated successfully' })
    @ApiResponse({ status: 404, description: 'Onboarding or task not found' })
    async updateTaskStatus(
        @Param('id') id: string,
        @Param('taskName') taskName: string,
        @Body() dto: UpdateTaskStatusDto,
    ) {
        return this.onboardingService.updateTaskStatus(id, taskName, dto);
    }

    // ============================================================
    // ONB-005: Reminders and Notifications
    // ============================================================

    @Get('employee/:employeeId/pending-tasks')
    @ApiOperation({
        summary: 'ONB-005: Get pending tasks with reminders',
        description: 'New Hire receives reminders for pending and overdue tasks. BR 12: Track reminders and task assignments.',
    })
    @ApiParam({ name: 'employeeId', description: 'employee ID' })
    @ApiResponse({ status: 200, description: 'Pending and overdue tasks' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    async getPendingTasks(@Param('employeeId') employeeId: string) {
        return this.onboardingService.getPendingTasks(employeeId);
    }

    // ============================================================
    // ONB-007: Upload Documents
    // ============================================================

    @Post('documents')
    @ApiOperation({
        summary: 'ONB-007: Upload compliance documents',
        description: 'New Hire uploads documents (ID, contracts, certifications). BR 7: Documents collected before first working day.',
    })
    @ApiBody({ type: UploadDocumentDto })
    @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
    async uploadDocument(@Body() dto: UploadDocumentDto) {
        return this.onboardingService.uploadDocument(dto);
    }

    @Get('documents/owner/:ownerId')
    @ApiOperation({
        summary: 'Get documents by owner',
        description: 'Retrieve all documents uploaded by employee/candidate',
    })
    @ApiParam({ name: 'ownerId', description: 'Owner ID (employee/candidate)' })
    @ApiResponse({ status: 200, description: 'List of documents' })
    async getDocumentsByOwner(@Param('ownerId') ownerId: string) {
        return this.onboardingService.getDocumentsByOwner(ownerId);
    }

    @Patch(':id/tasks/:taskName/document')
    @ApiOperation({
        summary: 'Link document to task',
        description: 'Associate uploaded document with onboarding task',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiParam({ name: 'taskName', description: 'Task name' })
    @ApiBody({ schema: { properties: { documentId: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Document linked successfully' })
    @ApiResponse({ status: 404, description: 'Onboarding or task not found' })
    async linkDocumentToTask(
        @Param('id') id: string,
        @Param('taskName') taskName: string,
        @Body('documentId') documentId: string,
    ) {
        return this.onboardingService.linkDocumentToTask(id, taskName, documentId);
    }

    // ============================================================
    // ONB-009: Provision System Access
    // ============================================================

    @Post('provision-access')
    @ApiOperation({
        summary: 'ONB-009: Provision system access',
        description: 'System Admin provisions system access (payroll, email, internal systems). BR 9(b): Auto IT tasks for email, laptop, system access.',
    })
    @ApiBody({ type: ProvisionAccessDto })
    @ApiResponse({ status: 200, description: 'System access provisioned successfully' })
    async provisionSystemAccess(@Body() dto: ProvisionAccessDto) {
        return this.onboardingService.provisionSystemAccess(dto);
    }

    // ============================================================
    // ONB-012: Reserve Equipment and Resources
    // ============================================================

    @Post('reserve-equipment')
    @ApiOperation({
        summary: 'ONB-012: Reserve equipment and resources',
        description: 'HR employee reserves equipment, desk and access cards for new hires. BR 9(c): Auto Admin tasks for workspace, ID badge.',
    })
    @ApiBody({ type: ReserveEquipmentDto })
    @ApiResponse({ status: 200, description: 'Equipment and resources reserved successfully' })
    async reserveEquipment(@Body() dto: ReserveEquipmentDto) {
        return this.onboardingService.reserveEquipment(dto);
    }

    // ============================================================
    // ONB-013: Schedule Access Revocation
    // ============================================================

    @Post('schedule-access-revocation')
    @ApiOperation({
        summary: 'ONB-013: Schedule automated access revocation',
        description: 'HR Manager schedules automated account provisioning and revocation. BR 9(b): IT allocation automated. Links to Offboarding (OFF-007).',
    })
    @ApiBody({ type: ScheduleAccessRevocationDto })
    @ApiResponse({ status: 200, description: 'Access revocation scheduled successfully' })
    async scheduleAccessRevocation(@Body() dto: ScheduleAccessRevocationDto) {
        return this.onboardingService.scheduleAccessRevocation(dto);
    }

    // ============================================================
    // ONB-018: Trigger Payroll Initiation
    // ============================================================

    @Post('trigger-payroll-initiation')
    @ApiOperation({
        summary: 'ONB-018: Trigger payroll initiation',
        description: 'HR Manager triggers automatic payroll initiation based on contract signing. BR 9(a): Auto HR tasks for payroll & benefits. REQ-PY-23.',
    })
    @ApiBody({ type: TriggerPayrollInitiationDto })
    @ApiResponse({ status: 200, description: 'Payroll initiation triggered successfully' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    async triggerPayrollInitiation(@Body() dto: TriggerPayrollInitiationDto) {
        return this.onboardingService.triggerPayrollInitiation(dto);
    }

    // ============================================================
    // ONB-019: Process Signing Bonuses
    // ============================================================

    @Post('contracts/:contractId/process-signing-bonus')
    @ApiOperation({
        summary: 'ONB-019: Process signing bonus',
        description: 'HR Manager processes signing bonuses from contract. BR 9(a): Bonuses as distinct payroll components. REQ-PY-27.',
    })
    @ApiParam({ name: 'contractId', description: 'Contract ID' })
    @ApiResponse({ status: 200, description: 'Signing bonus processed successfully' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @ApiResponse({ status: 400, description: 'No signing bonus in contract' })
    async processSigningBonus(@Param('contractId') contractId: string) {
        return this.onboardingService.processSigningBonus(contractId);
    }

    // ============================================================
    // ONB-020: Cancel Onboarding (No-Show)
    // ============================================================

    @Delete(':id/cancel')
    @ApiOperation({
        summary: 'Cancel onboarding (No-Show)',
        description: 'BR20: System allows onboarding cancellation/termination of employee profile in case of no-show.',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiBody({ type: CancelOnboardingDto })
    @ApiResponse({ status: 200, description: 'Onboarding cancelled successfully' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    @ApiResponse({ status: 400, description: 'Cannot cancel completed onboarding' })
    async cancelOnboarding(
        @Param('id') id: string,
        @Body() dto: CancelOnboardingDto,
    ) {
        return this.onboardingService.cancelOnboarding(id, dto);
    }
}

