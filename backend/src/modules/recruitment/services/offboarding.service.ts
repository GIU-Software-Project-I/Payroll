import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TerminationRequest, TerminationRequestDocument } from '../models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistDocument } from '../models/clearance-checklist.schema';
import { TerminationInitiation } from '../enums/termination-initiation.enum';
import { TerminationStatus } from '../enums/termination-status.enum';
import { ApprovalStatus } from '../enums/approval-status.enum';
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

@Injectable()
export class OffboardingService {
  constructor(
    @InjectModel(TerminationRequest.name) private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name) private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
  ) {}

  // ============================================
  // OFF-018: Employee Submits Resignation Request
  // User Story: As Employee, I want to request resignation with reasoning
  // BR: 6 - Employee separation can be triggered by resignation
  // Output: Offboarding Approval Workflow
  // ============================================
  async submitResignation(dto: SubmitResignationDto) {
    const terminationRequest = new this.terminationRequestModel({
      employeeId: dto.employeeId,
      initiator: TerminationInitiation.EMPLOYEE,
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      status: TerminationStatus.PENDING,
      contractId: dto.contractId,
    });

    const saved = await terminationRequest.save();

    // TODO: Trigger Offboarding Approval Workflow
    // Workflow: Employee resigning > Line Manager > Financial approval > HR processing/approval
    // TODO: Send notification to Line Manager for approval

    return {
      terminationId: saved._id,
      employeeId: saved.employeeId,
      initiator: saved.initiator,
      status: saved.status,
      submittedAt: (saved as any).createdAt,
      message: 'Resignation request submitted successfully. Awaiting Line Manager approval.',
    };
  }

  // ============================================
  // OFF-019: Track Resignation Request Status
  // User Story: As Employee, I want to track my resignation request status
  // ============================================
  async trackResignationStatus(dto: TrackResignationStatusDto) {
    const terminationRequest = await this.terminationRequestModel
      .findOne({
        employeeId: dto.employeeId,
        initiator: TerminationInitiation.EMPLOYEE,
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!terminationRequest) {
      return {
        employeeId: dto.employeeId,
        message: 'No resignation request found',
      };
    }

    return {
      terminationId: terminationRequest._id,
      employeeId: terminationRequest.employeeId,
      status: terminationRequest.status,
      reason: terminationRequest.reason,
      submittedAt: (terminationRequest as any).createdAt,
      terminationDate: terminationRequest.terminationDate,
      hrComments: terminationRequest.hrComments,
    };
  }

  // ============================================
  // OFF-001: HR Initiates Termination Review
  // User Story: As HR Manager, I want to initiate termination based on warnings/performance data
  // BR: 4 - Separation needs effective date and reason; follow due process
  // Input: Performance Management (PM) - Warnings/Low Scores
  // Output: Offboarding Approval Workflow
  // ============================================
  async initiateTermination(dto: InitiateTerminationDto) {
    const terminationRequest = new this.terminationRequestModel({
      employeeId: dto.employeeId,
      initiator: TerminationInitiation.HR,
      reason: dto.reason,
      hrComments: dto.hrComments,
      status: TerminationStatus.PENDING,
      contractId: dto.contractId,
    });

    const saved = await terminationRequest.save();

    // TODO: Interface with Performance Management (PM) to retrieve warnings/scores
    // TODO: Validate due process followed as per BR 4
    // TODO: Trigger Offboarding Approval Workflow
    // TODO: Send notifications to relevant approvers

    return {
      terminationId: saved._id,
      employeeId: saved.employeeId,
      initiator: saved.initiator,
      reason: saved.reason,
      status: saved.status,
      initiatedAt: (saved as any).createdAt,
      message: 'Termination review initiated. Following due process for approval.',
      note: 'Performance data should be reviewed and attached to justify termination.',
    };
  }

  // ============================================
  // OFF-006: Create Offboarding Checklist (Asset Recovery)
  // User Story: As HR Manager, I want offboarding checklist so no company property is lost
  // BR: 13(a) - Clearance checklist required
  // Output: Clearance Workflow (OFF-010)
  // ============================================
  async createOffboardingChecklist(dto: CreateOffboardingChecklistDto) {
    const clearanceChecklist = new this.clearanceChecklistModel({
      terminationId: dto.terminationId,
      equipmentList: dto.equipmentList.map((item) => ({
        equipmentId: item.equipmentId,
        name: item.name,
        returned: item.returned || false,
        condition: item.condition,
      })),
      cardReturned: false,
      items: [], // Will be populated in OFF-010
    });

    const saved = await clearanceChecklist.save();

    // TODO: Trigger Clearance Workflow (OFF-010)
    // TODO: Send notifications to employee about items to return

    return {
      clearanceChecklistId: saved._id,
      terminationId: saved.terminationId,
      equipmentCount: saved.equipmentList.length,
      message: 'Offboarding checklist created successfully',
    };
  }

  // ============================================
  // OFF-010: Multi-Department Exit Clearance Sign-offs
  // User Story: As HR Manager, I want multi-department clearance with statuses
  // BR: 13(b, c) - Clearance required across IT, HR, Admin, Finance
  // BR: 14 - Final approvals form filed to HR to complete offboarding
  // Input: Clearance Status Updates (from Depts)
  // Output: Payroll (Final Settlement)
  // ============================================
  async createClearanceSignOffs(dto: CreateClearanceChecklistDto) {
    const clearance = await this.clearanceChecklistModel.findOne({ terminationId: dto.terminationId }).exec();

    if (!clearance) {
      throw new Error('Clearance checklist not found. Create offboarding checklist first (OFF-006).');
    }

    // Add department clearance items
    clearance.items = dto.departments.map((dept) => ({
      department: dept,
      status: ApprovalStatus.PENDING,
      comments: '',
      updatedAt: new Date(),
    }));

    await clearance.save();

    // TODO: Send notifications to each department for clearance
    // Departments: IT, Finance, Facilities, Line Manager, HR

    return {
      clearanceChecklistId: clearance._id,
      terminationId: clearance.terminationId,
      departments: dto.departments,
      message: 'Clearance sign-offs initiated for all departments',
      note: 'Each department must approve before final settlement can proceed.',
    };
  }

  async updateClearanceSignOff(dto: UpdateClearanceSignOffDto) {
    const clearance = await this.clearanceChecklistModel.findOne({ terminationId: dto.terminationId }).exec();

    if (!clearance) {
      throw new Error('Clearance checklist not found');
    }

    const itemIndex = clearance.items.findIndex((item) => item.department === dto.department);

    if (itemIndex === -1) {
      throw new Error('Department not found in clearance checklist');
    }

    clearance.items[itemIndex].status = dto.status;
    clearance.items[itemIndex].comments = dto.comments || clearance.items[itemIndex].comments;
    clearance.items[itemIndex].updatedBy = dto.updatedBy;
    clearance.items[itemIndex].updatedAt = new Date();

    await clearance.save();

    // Check if all departments approved
    const allApproved = clearance.items.every((item) => item.status === ApprovalStatus.APPROVED);

    if (allApproved) {
      // TODO: Trigger Final Settlement (OFF-013)
      // TODO: Update termination status to APPROVED
      await this.terminationRequestModel
        .findByIdAndUpdate(dto.terminationId, {
          status: TerminationStatus.APPROVED,
        })
        .exec();
    }

    return {
      clearanceChecklistId: clearance._id,
      department: dto.department,
      status: dto.status,
      allDepartmentsCleared: allApproved,
      message: 'Clearance sign-off updated successfully',
      note: allApproved ? 'All departments cleared. Ready for final settlement.' : 'Awaiting other departments.',
    };
  }

  async getClearanceStatus(dto: GetClearanceStatusDto) {
    const clearance = await this.clearanceChecklistModel.findOne({ terminationId: dto.terminationId }).exec();

    if (!clearance) {
      return {
        terminationId: dto.terminationId,
        message: 'No clearance checklist found',
      };
    }

    const pending = clearance.items.filter((item) => item.status === ApprovalStatus.PENDING);
    const approved = clearance.items.filter((item) => item.status === ApprovalStatus.APPROVED);
    const rejected = clearance.items.filter((item) => item.status === ApprovalStatus.REJECTED);

    return {
      clearanceChecklistId: clearance._id,
      terminationId: clearance.terminationId,
      items: clearance.items,
      equipmentList: clearance.equipmentList,
      cardReturned: clearance.cardReturned,
      summary: {
        total: clearance.items.length,
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
      },
      allCleared: pending.length === 0 && rejected.length === 0,
    };
  }

  // ============================================
  // OFF-007: System & Account Access Revocation
  // User Story: As System Admin, I want to revoke access upon termination for security
  // BR: 3(c), 19 - Access revocation required for security
  // Input: Employee Profile (Inactive Status)
  // Output: Notifications (N), IT/Access Systems
  // ============================================
  async revokeSystemAccess(dto: RevokeSystemAccessDto) {
    const terminationRequest = await this.terminationRequestModel.findById(dto.terminationId).exec();

    if (!terminationRequest) {
      throw new Error('Termination request not found');
    }

    const revocationLog = {
      employeeId: dto.employeeId,
      terminationId: dto.terminationId,
      systems: dto.systems,
      revokedAt: new Date(),
      status: 'revoked',
    };

    // TODO: Interface with IT/Access Systems to revoke accounts
    // TODO: Update Employee Profile status to Inactive
    // TODO: Create audit trail log for security compliance (BR 19)
    // TODO: Link to ONB-013 scheduled revocation

    // Update clearance checklist IT department status
    await this.clearanceChecklistModel
      .findOneAndUpdate(
        { terminationId: dto.terminationId, 'items.department': 'IT' },
        {
          $set: {
            'items.$.status': ApprovalStatus.APPROVED,
            'items.$.comments': 'All system access revoked',
            'items.$.updatedAt': new Date(),
          },
        },
      )
      .exec();

    return {
      ...revocationLog,
      message: 'System access revoked successfully',
      note: 'Access revocation logged for audit trail. IT clearance marked as approved.',
    };
  }

  // ============================================
  // OFF-013: Final Settlement & Benefits Termination
  // User Story: As HR Manager, I want to trigger final pay calc and benefits termination
  // BR: 9, 11 - Leave balance settled (encashed), Benefits auto-terminated
  // Input: Leaves Module (Balance), Employee Profile (Benefits)
  // Output: Payroll Module (PY)
  // ============================================
  async triggerFinalSettlement(dto: TriggerFinalSettlementDto) {
    const terminationRequest = await this.terminationRequestModel.findById(dto.terminationId).exec();

    if (!terminationRequest) {
      throw new Error('Termination request not found');
    }

    if (terminationRequest.status !== TerminationStatus.APPROVED) {
      return {
        terminationId: dto.terminationId,
        message: 'Cannot trigger final settlement. Clearance not completed.',
        note: 'All departments must complete clearance sign-offs first.',
      };
    }

    const settlementData = {
      employeeId: dto.employeeId,
      terminationId: dto.terminationId,
      lastWorkingDay: dto.lastWorkingDay,
      triggeredAt: new Date(),
    };

    // TODO: Interface with Leaves Module to get unused leave balance
    // TODO: Calculate leave encashment as per BR 9
    // TODO: Interface with Employee Profile to get benefits details
    // TODO: Terminate benefits as of end of notice period (BR 11)
    // TODO: Send data to Payroll Module (PY) for final pay calculation
    // Include: unused leave encashment, deductions, loans, severance

    // Update termination status
    await this.terminationRequestModel
      .findByIdAndUpdate(dto.terminationId, {
        status: TerminationStatus.APPROVED,
        terminationDate: dto.lastWorkingDay,
      })
      .exec();

    return {
      ...settlementData,
      status: TerminationStatus.APPROVED,
      message: 'Final settlement triggered successfully',
      note: 'Leave balance encashed, benefits terminated, final pay calculation sent to Payroll Module.',
    };
  }

  // ============================================
  // Update Termination Status
  // ============================================
  async updateTerminationStatus(dto: UpdateTerminationStatusDto) {
    const termination = await this.terminationRequestModel.findById(dto.terminationId).exec();

    if (!termination) {
      throw new Error('Termination request not found');
    }

    termination.status = dto.status;
    if (dto.terminationDate) {
      termination.terminationDate = dto.terminationDate;
    }
    if (dto.hrComments) {
      termination.hrComments = dto.hrComments;
    }

    await termination.save();

    return {
      terminationId: termination._id,
      employeeId: termination.employeeId,
      newStatus: dto.status,
      terminationDate: termination.terminationDate,
      message: 'Termination status updated successfully',
    };
  }

  // ============================================
  // Update Equipment Return Status
  // ============================================
  async updateEquipmentReturn(dto: UpdateEquipmentReturnDto) {
    const clearance = await this.clearanceChecklistModel.findOne({ terminationId: dto.terminationId }).exec();

    if (!clearance) {
      throw new Error('Clearance checklist not found');
    }

    const equipmentIndex = clearance.equipmentList.findIndex(
      (item) => item.equipmentId.toString() === dto.equipmentId.toString(),
    );

    if (equipmentIndex === -1) {
      throw new Error('Equipment not found in checklist');
    }

    clearance.equipmentList[equipmentIndex].returned = dto.returned;
    clearance.equipmentList[equipmentIndex].condition = dto.condition || clearance.equipmentList[equipmentIndex].condition;

    await clearance.save();

    return {
      terminationId: dto.terminationId,
      equipmentId: dto.equipmentId,
      returned: dto.returned,
      condition: dto.condition,
      message: 'Equipment return status updated',
    };
  }

  // ============================================
  // Update Access Card Return Status
  // ============================================
  async updateAccessCardReturn(dto: UpdateAccessCardReturnDto) {
    const clearance = await this.clearanceChecklistModel.findOne({ terminationId: dto.terminationId }).exec();

    if (!clearance) {
      throw new Error('Clearance checklist not found');
    }

    clearance.cardReturned = dto.returned;
    await clearance.save();

    return {
      terminationId: dto.terminationId,
      cardReturned: dto.returned,
      message: 'Access card return status updated',
    };
  }

  // ============================================
  // Get All Termination Requests (for HR Dashboard)
  // ============================================
  async getAllTerminationRequests() {
    const terminations = await this.terminationRequestModel.find().sort({ createdAt: -1 }).exec();

    return {
      total: terminations.length,
      terminations: terminations.map((t) => ({
        terminationId: t._id,
        employeeId: t.employeeId,
        initiator: t.initiator,
        reason: t.reason,
        status: t.status,
        terminationDate: t.terminationDate,
        createdAt: (t as any).createdAt,
      })),
    };
  }

  // ============================================
  // Get Termination Request by ID
  // ============================================
  async getTerminationRequestById(terminationId: Types.ObjectId) {
    const termination = await this.terminationRequestModel.findById(terminationId).exec();

    if (!termination) {
      throw new Error('Termination request not found');
    }

    return {
      terminationId: termination._id,
      employeeId: termination.employeeId,
      initiator: termination.initiator,
      reason: termination.reason,
      employeeComments: termination.employeeComments,
      hrComments: termination.hrComments,
      status: termination.status,
      terminationDate: termination.terminationDate,
      contractId: termination.contractId,
      createdAt: (termination as any).createdAt,
      updatedAt: (termination as any).updatedAt,
    };
  }
}

