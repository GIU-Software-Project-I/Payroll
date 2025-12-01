import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { Types } from 'mongoose';
import {
  CreateOnboardingChecklistDto,
  AccessContractDetailsDto,
  GetOnboardingTrackerDto,
  UploadDocumentDto,
  ProvisionSystemAccessDto,
  ReserveEquipmentDto,
  ScheduleAccountProvisioningDto,
  InitiatePayrollDto,
  ProcessSigningBonusDto,
  UpdateOnboardingTaskDto,
  InitiateOnboardingDto,
} from '../dto/onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ============================================
  // REQUIREMENT: Setup & Task Management
  // User Story: Candidate initiates onboarding by uploading signed contract and forms
  // ============================================
  @Post('initiate-by-candidate')
  async initiateOnboardingByCandidate(@Body() dto: InitiateOnboardingDto) {
    return this.onboardingService.initiateOnboardingByCandidate(dto);
  }

  // ============================================
  // ONB-001: Create Onboarding Task Checklists
  // User Story: As HR Manager, I want to create onboarding task checklists
  // ============================================
  @Post('checklist/create')
  async createOnboardingChecklist(@Body() dto: CreateOnboardingChecklistDto) {
    return this.onboardingService.createOnboardingChecklist(dto);
  }

  // ============================================
  // ONB-002: Access Signed Contract Details
  // User Story: As HR Manager, I want to access signed contract detail to create employee profile
  // ============================================
  // @Get('contract/:contractId')
  // async getContractDetails(@Param('contractId') contractId: string) {
  //   const dto: AccessContractDetailsDto = {
  //     contractId: contractId,
  //   };
  //   return this.onboardingService.getContractDetails(dto);
  // }

  // ============================================
  // ONB-004: View Onboarding Steps in Tracker
  // User Story: As New Hire, I want to view my onboarding steps
  // ============================================
  @Get('tracker/:employeeId')
  async getOnboardingTracker(@Param('employeeId') employeeId: string) {
    const dto: GetOnboardingTrackerDto = {
      employeeId: employeeId,
    };
    return this.onboardingService.getOnboardingTracker(dto);
  }

  // ============================================
  // ONB-005: Trigger Reminders and Notifications
  // User Story: As New Hire, I want to receive reminders
  // ============================================
  // @Post('reminders/:employeeId')
  // async triggerReminders(@Param('employeeId') employeeId: string) {
  //   return this.onboardingService.triggerOnboardingReminders(employeeId);
  // }

  // ============================================
  // ONB-007: Upload Compliance Documents
  // User Story: As New Hire, I want to upload documents
  // ============================================
  @Post('documents/upload')
  async uploadComplianceDocument(@Body() dto: UploadDocumentDto) {
    return this.onboardingService.uploadComplianceDocument(dto);
  }

  // ============================================
  // ONB-009: Provision System Access
  // User Story: As System Admin, I want to provision system access
  // ============================================
  @Post('access/provision')
  async provisionSystemAccess(@Body() dto: ProvisionSystemAccessDto) {
    return this.onboardingService.provisionSystemAccess(dto);
  }

  // ============================================
  // ONB-012: Reserve and Track Equipment
  // User Story: As HR Employee, I want to reserve equipment
  // ============================================
  @Post('equipment/reserve')
  async reserveEquipment(@Body() dto: ReserveEquipmentDto) {
    return this.onboardingService.reserveEquipment(dto);
  }

  // ============================================
  // ONB-013: Schedule Automated Account Provisioning
  // User Story: As HR Manager, I want automated provisioning and revocation
  // ============================================
  @Post('access/schedule')
  async scheduleAccountProvisioning(@Body() dto: ScheduleAccountProvisioningDto) {
    return this.onboardingService.scheduleAccountProvisioning(dto);
  }

  // ============================================
  // ONB-018: Automate Payroll Initiation
  // User Story: As HR Manager, I want system to handle payroll initiation
  // ============================================
  @Post('payroll/initiate')
  async initiatePayroll(@Body() dto: InitiatePayrollDto) {
    return this.onboardingService.initiatePayroll(dto);
  }

  // ============================================
  // ONB-019: Process Signing Bonus
  // User Story: As HR Manager, I want to process signing bonuses
  // ============================================
  @Post('payroll/signing-bonus')
  async processSigningBonus(@Body() dto: ProcessSigningBonusDto) {
    return this.onboardingService.processSigningBonus(dto);
  }

  // ============================================
  // Update Onboarding Task Status
  // ============================================
  @Put('task/update')
  async updateTaskStatus(@Body() dto: UpdateOnboardingTaskDto) {
    return this.onboardingService.updateTaskStatus(dto);
  }

  // ============================================
  // Cancel Onboarding (No Show)
  // BR: 20 - Allow cancellation if employee doesn't show
  // ============================================
  // @Post('cancel/:employeeId')
  // async cancelOnboarding(@Param('employeeId') employeeId: string, @Body() body: { reason: string }) {
  //   return this.onboardingService.cancelOnboarding(employeeId, body.reason);
  // }
}

