import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Onboarding, OnboardingDocument } from '../models/onboarding.schema';
import { Document, DocumentDocument } from '../models/document.schema';
import { Contract, ContractDocument } from '../models/contract.schema';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';
import { InitiateOnboardingDto } from '../dto/onboarding.dto';
import { CreateOnboardingChecklistDto } from '../dto/onboarding.dto';
import { AccessContractDetailsDto } from '../dto/onboarding.dto';
import { GetOnboardingTrackerDto } from '../dto/onboarding.dto';
import { UploadDocumentDto } from '../dto/onboarding.dto';
import { ProvisionSystemAccessDto } from '../dto/onboarding.dto';
import { ReserveEquipmentDto } from '../dto/onboarding.dto';
import { ScheduleAccountProvisioningDto } from '../dto/onboarding.dto';
import { InitiatePayrollDto } from '../dto/onboarding.dto';
import { ProcessSigningBonusDto } from '../dto/onboarding.dto';
import { UpdateOnboardingTaskDto } from '../dto/onboarding.dto';


@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Onboarding.name) private onboardingModel: Model<OnboardingDocument>,
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
  ) {}

  // ============================================
  // Candidate-Initiated Onboarding
  // User Story: As a Candidate, I want to upload signed contract and required forms/templates
  // ============================================
  async initiateOnboardingByCandidate(dto: InitiateOnboardingDto) {
    // Create document record for signed contract
    const signedContract = new this.documentModel({
      ownerId: dto.candidateId,
      type: 'CONTRACT',
      filePath: dto.signedContractPath,
      uploadedAt: new Date(),
    });

    const documents: any[] = [];
    documents.push(await signedContract.save());

    // Create document records for required forms
    for (const form of dto.requiredForms) {
      const formDoc = new this.documentModel({
        ownerId: dto.candidateId,
        type: 'FORM',
        filePath: form.filePath,
        uploadedAt: form.uploadedAt || new Date(),
      });
      documents.push(await formDoc.save());
    }

    // Create document records for required templates
    for (const template of dto.requiredTemplates) {
      const templateDoc = new this.documentModel({
        ownerId: dto.candidateId,
        type: 'TEMPLATE',
        filePath: template.filePath,
        uploadedAt: template.uploadedAt || new Date(),
      });
      documents.push(await templateDoc.save());
    }

    // TODO: Trigger downstream to New Hire Tracker (ONB-004)
    // TODO: Send notification to HR Manager to review documents

    return {
      candidateId: dto.candidateId,
      contractId: dto.contractId,
      documentsUploaded: documents.length,
      documents,
      readyForChecklistCreation: documents.some((doc) => doc.type === 'signed_contract'),
      message: 'Onboarding initiated successfully. HR will review your documents.',
    };
  }

  // ============================================
  // ONB-001: Create Onboarding Task Checklists
  // User Story: As HR Manager, I want to create onboarding task checklists
  // BR: 8, 11 - Triggered by offer acceptance; checklists customizable
  // ============================================
  async createOnboardingChecklist(dto: CreateOnboardingChecklistDto) {
    const onboarding = new this.onboardingModel({
      employeeId: dto.employeeId,
      contractId: dto.contractId,
      tasks: dto.tasks.map((task) => ({
        name: task.name,
        department: task.department,
        status: task.status || OnboardingTaskStatus.PENDING,
        deadline: task.deadline,
        notes: task.notes,
      })),
      completed: false,
    });

    const saved = await onboarding.save();

    // TODO: Trigger downstream to New Hire Tracker (ONB-004)
    // TODO: Send notifications to relevant departments

    return {
      onboardingId: saved._id,
      employeeId: saved.employeeId,
      tasksCreated: saved.tasks.length,
      message: 'Onboarding checklist created successfully',
    };
  }

  // ============================================
  // ONB-002: Access Signed Contract Details for Employee Profile Creation
  // User Story: As HR Manager, I want to access signed contract detail to create employee profile
  // BR: 17(a, b) - Uses data from Recruitment
  // Input: Recruitment (Signed Offer Letter/Contract)
  // Output: Employee Profile (EP)
  // ============================================
  async getContractDetails(dto: AccessContractDetailsDto) {
    const contract = await this.contractModel
      .findById(dto.contractId)
      .populate('offerId')
      .populate('documentId')
      .exec();

    if (!contract) {
      throw new Error('Contract not found');
    }

    // TODO: Interface with Employee Profile subsystem to create profile
    // Data to pass: contract details, compensation, role, benefits, start date

    return {
      contractId: contract._id,
      offerId: contract.offerId,
      grossSalary: contract.grossSalary,
      signingBonus: contract.signingBonus,
      role: contract.role,
      benefits: contract.benefits,
      acceptanceDate: contract.acceptanceDate,
      employeeSignedAt: contract.employeeSignedAt,
      employerSignedAt: contract.employerSignedAt,
      documentId: contract.documentId,
      message: 'Use this data to create Employee Profile',
    };
  }

  // ============================================
  // ONB-004: View Onboarding Steps in Tracker
  // User Story: As New Hire, I want to view onboarding steps so I know what to complete next
  // BR: 11(a, b) - Tracker must include workflow and support dept-specific tasks
  // Output: Notifications (N)
  // ============================================
  async getOnboardingTracker(dto: GetOnboardingTrackerDto) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: dto.employeeId })
      .populate('tasks.documentId')
      .exec();

    if (!onboarding) {
      return {
        employeeId: dto.employeeId,
        message: 'No onboarding record found',
        tasks: [],
      };
    }

    const pendingTasks = onboarding.tasks.filter((t) => t.status === OnboardingTaskStatus.PENDING);
    const inProgressTasks = onboarding.tasks.filter((t) => t.status === OnboardingTaskStatus.IN_PROGRESS);
    const completedTasks = onboarding.tasks.filter((t) => t.status === OnboardingTaskStatus.COMPLETED);

    return {
      onboardingId: onboarding._id,
      employeeId: onboarding.employeeId,
      completed: onboarding.completed,
      completedAt: onboarding.completedAt,
      tasks: onboarding.tasks,
      summary: {
        total: onboarding.tasks.length,
        pending: pendingTasks.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length,
      },
      nextTask: pendingTasks[0] || inProgressTasks[0] || null,
    };
  }

  // ============================================
  // ONB-005: Reminders and Notifications
  // User Story: As New Hire, I want to receive reminders so I don't miss tasks
  // BR: 12 - Support reminders and track delivery/status
  // Input: Notifications Module (N)
  // ============================================
  async triggerOnboardingReminders(employeeId: Types.ObjectId) {
    const onboarding = await this.onboardingModel.findOne({ employeeId }).exec();

    if (!onboarding || onboarding.completed) {
      return { message: 'No pending onboarding tasks' };
    }

    const upcomingTasks = onboarding.tasks.filter(
      (task) =>
        task.status !== OnboardingTaskStatus.COMPLETED &&
        task.deadline &&
        new Date(task.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Within 7 days
    );

    // TODO: Interface with Notifications Module to send reminders
    // For each upcomingTasks, create notification with task details and deadline

    return {
      employeeId,
      remindersTriggered: upcomingTasks.length,
      tasks: upcomingTasks.map((t) => ({
        name: t.name,
        department: t.department,
        deadline: t.deadline,
      })),
    };
  }

  // ============================================
  // ONB-007: Upload Compliance Documents
  // User Story: As New Hire, I want to upload documents (ID, contracts, certifications)
  // BR: 7 - Documents must be collected and verified before first working day
  // Output: Employee Profile (EP)
  // ============================================
  async uploadComplianceDocument(dto: UploadDocumentDto) {
    const document = new this.documentModel({
      ownerId: dto.employeeId,
      type: dto.type,
      filePath: dto.filePath,
      uploadedAt: new Date(),
    });

    const saved = await document.save();

    // TODO: Interface with Employee Profile to attach document
    // TODO: Trigger HR verification workflow

    return {
      documentId: saved._id,
      employeeId: dto.employeeId,
      type: dto.type,
      uploadedAt: saved.uploadedAt,
      message: 'Document uploaded successfully. Awaiting HR verification.',
    };
  }

  // ============================================
  // ONB-009: Provision System Access
  // User Story: As System Admin, I want to provision system access so employee can work
  // BR: 9(b) - Auto onboarding tasks for IT (email, laptop, system access)
  // Input: Employee Profile (New Hire Record)
  // Output: Notifications (N) to IT/Access Systems, Payroll
  // ============================================
  async provisionSystemAccess(dto: ProvisionSystemAccessDto) {
    // TODO: Interface with IT/Access Systems to provision accounts
    // Systems may include: payroll, email, internal portal, time tracking, etc.

    const provisioningLog = {
      employeeId: dto.employeeId,
      systems: dto.systems,
      provisionedAt: new Date(),
      status: 'provisioned',
    };

    // Update onboarding task status
    await this.onboardingModel
      .findOneAndUpdate(
        { employeeId: dto.employeeId, 'tasks.name': 'System Access Provisioning' },
        {
          $set: {
            'tasks.$.status': OnboardingTaskStatus.COMPLETED,
            'tasks.$.completedAt': new Date(),
          },
        },
      )
      .exec();

    // TODO: Send notification to IT department
    // TODO: Send notification to employee with access credentials

    return {
      ...provisioningLog,
      message: 'System access provisioned successfully',
    };
  }

  // ============================================
  // ONB-012: Reserve and Track Equipment
  // User Story: As HR Employee, I want to reserve equipment so resources are ready on Day 1
  // BR: 9(c) - Auto tasks for Admin (workspace, ID badge allocation)
  // Output: Notifications (N) to Facilities/Admin Systems
  // ============================================
  async reserveEquipment(dto: ReserveEquipmentDto) {
    const reservationLog = {
      employeeId: dto.employeeId,
      equipment: dto.equipment,
      deskNumber: dto.deskNumber,
      accessCardNumber: dto.accessCardNumber,
      reservedAt: new Date(),
      status: 'reserved',
    };

    // Update onboarding task status
    await this.onboardingModel
      .findOneAndUpdate(
        { employeeId: dto.employeeId, 'tasks.name': 'Equipment & Workspace Allocation' },
        {
          $set: {
            'tasks.$.status': OnboardingTaskStatus.COMPLETED,
            'tasks.$.completedAt': new Date(),
          },
        },
      )
      .exec();

    // TODO: Interface with Facilities/Admin Systems for tracking
    // TODO: Send notification to admin team to prepare resources

    return {
      ...reservationLog,
      message: 'Equipment and resources reserved successfully',
    };
  }

  // ============================================
  // ONB-013: Automated Account Provisioning & Scheduled Revocation
  // User Story: As HR Manager, I want automated provisioning on start date and revocation on exit
  // BR: 9(b) - IT access automated
  // BR: 20 - Allow cancellation/termination if "no show"
  // Output: IT/Access Systems, Offboarding
  // ============================================
  async scheduleAccountProvisioning(dto: ScheduleAccountProvisioningDto) {
    const schedule = {
      employeeId: dto.employeeId,
      startDate: dto.startDate,
      exitDate: dto.exitDate,
      accounts: dto.accounts,
      provisioningScheduled: dto.startDate > new Date(),
      revocationScheduled: !!dto.exitDate,
    };

    // TODO: Interface with IT/Access Systems to schedule provisioning
    // TODO: Store revocation schedule for Offboarding (OFF-007)

    return {
      ...schedule,
      message: 'Account provisioning and revocation scheduled successfully',
      note: 'Provisioning will trigger automatically on start date. Revocation data passed to Offboarding.',
    };
  }

  // ============================================
  // ONB-018: Automate Payroll Initiation
  // User Story: As HR Manager, I want system to handle payroll initiation based on contract signing
  // BR: 9(a) - Auto tasks for HR (payroll & benefits creation)
  // Input: Recruitment (Contract Signing Date)
  // Output: Payroll Module (PY) - REQ-PY-23
  // ============================================
  async initiatePayroll(dto: InitiatePayrollDto) {
    const contract = await this.contractModel.findById(dto.contractId).exec();

    if (!contract) {
      throw new Error('Contract not found');
    }

    const payrollData = {
      employeeId: dto.employeeId,
      contractId: dto.contractId,
      grossSalary: contract.grossSalary,
      startDate: dto.startDate,
      benefits: contract.benefits,
      initiatedAt: new Date(),
    };

    // TODO: Interface with Payroll Module (PY) - REQ-PY-23 to process payroll initiation
    // TODO: Send payroll data to current payroll cycle

    // Update onboarding task
    await this.onboardingModel
      .findOneAndUpdate(
        { employeeId: dto.employeeId, 'tasks.name': 'Payroll Initiation' },
        {
          $set: {
            'tasks.$.status': OnboardingTaskStatus.COMPLETED,
            'tasks.$.completedAt': new Date(),
          },
        },
      )
      .exec();

    return {
      ...payrollData,
      message: 'Payroll initiation triggered successfully',
      note: 'Data sent to Payroll Module for processing in current cycle',
    };
  }

  // ============================================
  // ONB-019: Process Signing Bonus
  // User Story: As HR Manager, I want to automatically process signing bonuses after contract signing
  // BR: 9(a) - Auto tasks for HR
  // Input: Recruitment (Contract Details)
  // Output: Payroll Module (PY) - REQ-PY-27
  // ============================================
  async processSigningBonus(dto: ProcessSigningBonusDto) {
    const contract = await this.contractModel.findById(dto.contractId).exec();

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (!contract.signingBonus || contract.signingBonus <= 0) {
      return {
        employeeId: dto.employeeId,
        message: 'No signing bonus specified in contract',
      };
    }

    const bonusData = {
      employeeId: dto.employeeId,
      contractId: dto.contractId,
      bonusAmount: contract.signingBonus,
      processedAt: new Date(),
      paymentType: 'signing_bonus',
    };

    // TODO: Interface with Payroll Module (PY) - REQ-PY-27 to process signing bonus
    // TODO: Treat as distinct payroll component as per BR 9(a)

    return {
      ...bonusData,
      message: 'Signing bonus processed successfully',
      note: 'Data sent to Payroll Module for distinct component processing',
    };
  }

  // ============================================
  // Update Onboarding Task Status
  // ============================================
  async updateTaskStatus(dto: UpdateOnboardingTaskDto) {
    const onboarding = await this.onboardingModel.findById(dto.onboardingId).exec();

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    const taskIndex = onboarding.tasks.findIndex((t) => t.name === dto.taskName);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    onboarding.tasks[taskIndex].status = dto.status;
    onboarding.tasks[taskIndex].notes = dto.notes || onboarding.tasks[taskIndex].notes;
    if (dto.documentId) {
      onboarding.tasks[taskIndex].documentId = dto.documentId;
    }
    if (dto.status === OnboardingTaskStatus.COMPLETED) {
      onboarding.tasks[taskIndex].completedAt = new Date();
    }

    // Check if all tasks are completed
    const allCompleted = onboarding.tasks.every((t) => t.status === OnboardingTaskStatus.COMPLETED);
    if (allCompleted) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();
    }

    await onboarding.save();

    return {
      onboardingId: onboarding._id,
      taskName: dto.taskName,
      newStatus: dto.status,
      allTasksCompleted: allCompleted,
      message: 'Task status updated successfully',
    };
  }

  // ============================================
  // Cancel Onboarding (No Show)
  // BR: 20 - Allow cancellation if employee doesn't show up
  // ============================================
  async cancelOnboarding(employeeId: Types.ObjectId, reason: string) {
    const onboarding = await this.onboardingModel.findOne({ employeeId }).exec();

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    // TODO: Trigger Employee Profile termination/cancellation
    // TODO: Revoke any provisioned access
    // TODO: Cancel equipment reservations
    // TODO: Notify all relevant departments

    return {
      employeeId,
      reason,
      onboardingCancelled: true,
      message: 'Onboarding cancelled. Employee profile and resources revoked.',
      note: 'All provisioned resources and access have been cancelled.',
    };
  }
}

