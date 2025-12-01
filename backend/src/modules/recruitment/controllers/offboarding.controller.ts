import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { OffboardingService } from '../services/offboarding.service';
import { Types } from 'mongoose';
import { SubmitResignationDto } from '../dto/submit-resignation.dto';
import { TrackResignationStatusDto } from '../dto/track-resignation-status.dto';
import { InitiateTerminationDto } from '../dto/initiate-termination.dto';
import { CreateOffboardingChecklistDto } from '../dto/create-offboarding-checklist.dto';
import { CreateClearanceChecklistDto } from '../dto/create-clearance-checklist.dto';
import { UpdateClearanceSignOffDto } from '../dto/update-clearance-signoff.dto';
import { GetClearanceStatusDto } from '../dto/get-clearance-status.dto';
import { RevokeSystemAccessDto } from '../dto/revoke-system-access.dto';
import { TriggerFinalSettlementDto } from '../dto/trigger-final-settlement.dto';
import { UpdateTerminationStatusDto } from '../dto/update-termination-status.dto';
import { UpdateEquipmentReturnDto } from '../dto/update-equipment-return.dto';
import { UpdateAccessCardReturnDto } from '../dto/update-access-card-return.dto';

@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  // ============================================
  // OFF-018: Employee Submits Resignation Request
  // User Story: As Employee, I want to request resignation
  // ============================================
  @Post('resignation/submit')
  async submitResignation(@Body() dto: SubmitResignationDto) {
    return this.offboardingService.submitResignation(dto);
  }

  // ============================================
  // OFF-019: Track Resignation Request Status
  // User Story: As Employee, I want to track my resignation status
  // ============================================
  @Get('resignation/track/:employeeId')
  async trackResignationStatus(@Param('employeeId') employeeId: string) {
    const dto: TrackResignationStatusDto = {
      employeeId: employeeId,
    };
    return this.offboardingService.trackResignationStatus(dto);
  }

  // ============================================
  // OFF-001: HR Initiates Termination Review
  // User Story: As HR Manager, I want to initiate termination based on performance
  // ============================================
  @Post('termination/initiate')
  async initiateTermination(@Body() dto: InitiateTerminationDto) {
    return this.offboardingService.initiateTermination(dto);
  }

  // ============================================
  // OFF-006: Create Offboarding Checklist (Asset Recovery)
  // User Story: As HR Manager, I want offboarding checklist
  // ============================================
  @Post('checklist/create')
  async createOffboardingChecklist(@Body() dto: CreateOffboardingChecklistDto) {
    return this.offboardingService.createOffboardingChecklist(dto);
  }

  // ============================================
  // OFF-010: Multi-Department Exit Clearance Sign-offs
  // User Story: As HR Manager, I want multi-department clearance
  // ============================================
  @Post('clearance/create')
  async createClearanceSignOffs(@Body() dto: CreateClearanceChecklistDto) {
    return this.offboardingService.createClearanceSignOffs(dto);
  }

  @Put('clearance/update')
  async updateClearanceSignOff(@Body() dto: UpdateClearanceSignOffDto) {
    return this.offboardingService.updateClearanceSignOff(dto);
  }

  @Get('clearance/status/:terminationId')
  async getClearanceStatus(@Param('terminationId') terminationId: string) {
    const dto: GetClearanceStatusDto = {
      terminationId: terminationId,
    };
    return this.offboardingService.getClearanceStatus(dto);
  }

  // ============================================
  // OFF-007: System & Account Access Revocation
  // User Story: As System Admin, I want to revoke access
  // ============================================
  @Post('access/revoke')
  async revokeSystemAccess(@Body() dto: RevokeSystemAccessDto) {
    return this.offboardingService.revokeSystemAccess(dto);
  }

  // ============================================
  // OFF-013: Final Settlement & Benefits Termination
  // User Story: As HR Manager, I want to trigger final settlement
  // ============================================
  @Post('settlement/trigger')
  async triggerFinalSettlement(@Body() dto: TriggerFinalSettlementDto) {
    return this.offboardingService.triggerFinalSettlement(dto);
  }

  // ============================================
  // Update Termination Status
  // ============================================
  @Put('termination/status')
  async updateTerminationStatus(@Body() dto: UpdateTerminationStatusDto) {
    return this.offboardingService.updateTerminationStatus(dto);
  }

  // ============================================
  // Equipment Return Tracking
  // ============================================
  @Put('equipment/return')
  async updateEquipmentReturn(@Body() dto: UpdateEquipmentReturnDto) {
    return this.offboardingService.updateEquipmentReturn(dto);
  }

  @Put('access-card/return')
  async updateAccessCardReturn(@Body() dto: UpdateAccessCardReturnDto) {
    return this.offboardingService.updateAccessCardReturn(dto);
  }

  // ============================================
  // Get All Termination Requests (HR Dashboard)
  // ============================================
  @Get('terminations/all')
  async getAllTerminationRequests() {
    return this.offboardingService.getAllTerminationRequests();
  }

  // ============================================
  // Get Termination Request by ID
  // ============================================
  @Get('termination/:terminationId')
  async getTerminationRequestById(@Param('terminationId') terminationId: string) {
    return this.offboardingService.getTerminationRequestById(new Types.ObjectId(terminationId));
  }
}

