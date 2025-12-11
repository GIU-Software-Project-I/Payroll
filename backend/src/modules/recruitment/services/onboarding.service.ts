import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Models
import { Onboarding, OnboardingDocument } from '../models/onboarding.schema';
import { Contract, ContractDocument } from '../models/contract.schema';
import { Document, DocumentDocument } from '../models/document.schema';

// DTOs
import {CreateOnboardingDto, CreateOnboardingTaskDto, UpdateTaskStatusDto, UploadDocumentDto, ReserveEquipmentDto, ProvisionAccessDto, TriggerPayrollInitiationDto, ScheduleAccessRevocationDto, CancelOnboardingDto,} from '../dto/onboarding';

// Enums
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

@Injectable()
export class OnboardingService {
    constructor(
        @InjectModel(Onboarding.name) private onboardingModel: Model<OnboardingDocument>,
        @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
        @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    ) {}

    // ============================================================
    // ONB-001: Create Onboarding Task Checklists
    // ============================================================

    /**
     * ONB-001: As an HR Manager, I want to create onboarding task checklists,
     * so that new hires complete all required steps.
     *
     * BR 8, 11: Customizable checklists, department-specific tasks
     * Triggered by offer acceptance
     */
    async createOnboarding(dto: CreateOnboardingDto): Promise<Onboarding> {
        // TODO: Validate employee exists in employee Profile module

        // Validate contract exists
        const contract = await this.contractModel.findById(dto.contractId).exec();
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        // Check for existing onboarding
        const existing = await this.onboardingModel
            .findOne({ employeeId: new Types.ObjectId(dto.employeeId) })
            .exec();

        if (existing) {
            throw new ConflictException('Onboarding checklist already exists for this employee');
        }

        // BR 8, 11: Customizable checklists - tasks must be provided or use a template
        // TODO: Load default tasks from onboarding template configuration based on department/role
        if (!dto.tasks || dto.tasks.length === 0) {
            throw new BadRequestException(
                'Onboarding tasks must be provided. Alternatively, load from template configuration (TODO: implement template system)'
            );
        }

        const tasks = dto.tasks.map(task => ({
            name: task.name,
            department: task.department,
            status: OnboardingTaskStatus.PENDING,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
            documentId: task.documentId ? new Types.ObjectId(task.documentId) : undefined,
            notes: task.notes || '',
        }));

        const onboarding = new this.onboardingModel({
            employeeId: new Types.ObjectId(dto.employeeId),
            contractId: new Types.ObjectId(dto.contractId),
            tasks,
            completed: false,
        });

        return onboarding.save();
    }

    // ============================================================
    // ONB-002: Access Signed Contract Details
    // ============================================================

    /**
     * ONB-002: As an HR Manager, I want to be able to access signed contract
     * detail to be able create an employee profile.
     *
     * BR 17(a, b): Uses signed contract data from Recruitment
     * Outputs to employee Profile (EP)
     */
    async getContractDetails(contractId: string): Promise<Contract> {
        const contract = await this.contractModel
            .findById(contractId)
            .populate('offerId')
            .populate('documentId')
            .exec();

        if (!contract) {
            throw new NotFoundException(`Contract with ID ${contractId} not found`);
        }

        // Verify contract is signed
        if (!contract.employeeSignedAt || !contract.employerSignedAt) {
            throw new BadRequestException('Contract must be fully signed before creating employee profile');
        }

        // TODO: This contract data should be used to create employee Profile in employee module
        // TODO: Extract: role, grossSalary, signingBonus, benefits, acceptanceDate

        return contract;
    }

    // ============================================================
    // ONB-004: View Onboarding Steps (Tracker)
    // ============================================================

    /**
     * ONB-004: As a New Hire, I want to view my onboarding steps in a tracker,
     * so that I know what to complete next.
     *
     * BR 11(a, b): Onboarding workflow with department-specific tasks
     */
    async getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding> {
        const onboarding = await this.onboardingModel
            .findOne({ employeeId: new Types.ObjectId(employeeId) })
            .populate('contractId')
            .populate('tasks.documentId')
            .exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding not found for employee ${employeeId}`);
        }

        return onboarding;
    }

    /**
     * Get all onboarding records (for HR Manager)
     */
    async getAllOnboardings(): Promise<Onboarding[]> {
        return this.onboardingModel
            .find()
            .populate('contractId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get onboarding by ID
     */
    async getOnboardingById(id: string): Promise<Onboarding> {
        const onboarding = await this.onboardingModel
            .findById(id)
            .populate('contractId')
            .populate('tasks.documentId')
            .exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${id} not found`);
        }

        return onboarding;
    }

    // ============================================================
    // ONB-004: Update Task Status
    // ============================================================

    /**
     * Update individual task status in onboarding checklist
     */
    async updateTaskStatus(
        onboardingId: string,
        taskName: string,
        dto: UpdateTaskStatusDto,
    ): Promise<Onboarding> {
        const onboarding = await this.onboardingModel.findById(onboardingId).exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
        }

        const taskIndex = onboarding.tasks.findIndex(t => t.name === taskName);

        if (taskIndex === -1) {
            throw new NotFoundException(`Task "${taskName}" not found in onboarding checklist`);
        }

        onboarding.tasks[taskIndex].status = dto.status;
        if (dto.completedAt) {
            onboarding.tasks[taskIndex].completedAt = new Date(dto.completedAt);
        }

        // Check if all tasks are completed
        const allCompleted = onboarding.tasks.every(t => t.status === OnboardingTaskStatus.COMPLETED);
        if (allCompleted) {
            onboarding.completed = true;
            onboarding.completedAt = new Date();
        }

        return onboarding.save();
    }

    /**
     * Add task to onboarding checklist
     */
    async addTask(onboardingId: string, dto: CreateOnboardingTaskDto): Promise<Onboarding> {
        const onboarding = await this.onboardingModel.findById(onboardingId).exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
        }

        onboarding.tasks.push({
            name: dto.name,
            department: dto.department,
            status: OnboardingTaskStatus.PENDING,
            deadline: dto.deadline ? new Date(dto.deadline) : undefined,
            documentId: dto.documentId ? new Types.ObjectId(dto.documentId) : undefined,
            notes: dto.notes || '',
        });

        return onboarding.save();
    }

    // ============================================================
    // ONB-005: Reminders and Notifications
    // ============================================================

    /**
     * ONB-005: As a New Hire, I want to receive reminders and notifications,
     * so that I don't miss important onboarding tasks.
     *
     * BR 12: Track reminders and task assignments
     */
    async getPendingTasks(employeeId: string): Promise<{
        employeeId: string;
        pendingTasks: any[];
        overdueTasks: any[];
    }> {
        const onboarding = await this.onboardingModel
            .findOne({ employeeId: new Types.ObjectId(employeeId) })
            .exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding not found for employee ${employeeId}`);
        }

        const now = new Date();
        const pendingTasks = onboarding.tasks.filter(
            t => t.status === OnboardingTaskStatus.PENDING || t.status === OnboardingTaskStatus.IN_PROGRESS
        );

        const overdueTasks = pendingTasks.filter(t => t.deadline && new Date(t.deadline) < now);

        // TODO: Integration with Notifications Module (N)
        // TODO: Send reminders for pending tasks
        // TODO: Send urgent notifications for overdue tasks

        return {employeeId, pendingTasks, overdueTasks,};
    }

    // ============================================================
    // ONB-007: Upload Documents
    // ============================================================

    /**
     * ONB-007: As a New Hire, I want to upload documents (e.g., ID, contracts,
     * certifications), so that compliance is ensured.
     *
     * BR 7: Documents collected and verified before first working day
     */
    async uploadDocument(dto: UploadDocumentDto): Promise<Document> {
        // TODO: Validate employee/candidate exists

        const document = new this.documentModel({
            ownerId: new Types.ObjectId(dto.ownerId),
            type: dto.type,
            filePath: dto.filePath,
            uploadedAt: new Date(),
        });

        const saved = await document.save();

        // TODO: Store documents in employee Profile (EP)
        // TODO: Trigger verification workflow in HR

        return saved;
    }

    /**
     * Get all documents for an employee
     */
    async getDocumentsByOwner(ownerId: string): Promise<Document[]> {
        return this.documentModel
            .find({ ownerId: new Types.ObjectId(ownerId) })
            .sort({ uploadedAt: -1 })
            .exec();
    }

    /**
     * Link document to onboarding task
     */
    async linkDocumentToTask(onboardingId: string, taskName: string, documentId: string,): Promise<Onboarding> {
        const onboarding = await this.onboardingModel.findById(onboardingId).exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
        }

        const taskIndex = onboarding.tasks.findIndex(t => t.name === taskName);

        if (taskIndex === -1) {
            throw new NotFoundException(`Task "${taskName}" not found`);
        }

        onboarding.tasks[taskIndex].documentId = new Types.ObjectId(documentId);

        return onboarding.save();
    }

    // ============================================================
    // ONB-009: Provision System Access
    // ============================================================

    /**
     * ONB-009: As a System Admin, I want to provision system access
     * (payroll, email, internal systems), so that the employee can work.
     *
     * BR 9(b): Auto onboarding tasks for IT (email, laptop, system access)
     */
    async provisionSystemAccess(dto: ProvisionAccessDto): Promise<{ success: boolean; employeeId: string; message: string; provisionedAt: Date; }> {
        // TODO: Validate employee exists in employee Profile module

        // TODO: Integration with IT/Access Systems
        // TODO: Create email account
        // TODO: Setup SSO credentials
        // TODO: Grant access to payroll system
        // TODO: Grant access to internal tools
        // TODO: Grant access to time management (clock in/out)

        // TODO: Send notification to IT department
        // TODO: Send notification to employee with access details

        return {success: true, employeeId: dto.employeeId, message: 'System access provisioned successfully. Email, SSO, and internal systems enabled.', provisionedAt: new Date(),
        };
    }

    // ============================================================
    // ONB-012: Reserve Equipment and Resources
    // ============================================================

    /**
     * ONB-012: As a HR employee, I want to reserve and track equipment,
     * desk and access cards for new hires, so resources are ready on Day 1.
     *
     * BR 9(c): Auto onboarding tasks for Admin (workspace, ID badge)
     */
    async reserveEquipment(dto: ReserveEquipmentDto): Promise<{ success: boolean; employeeId: string; reservedItems: { equipment?: string[];deskNumber?: string; accessCardNumber?: string; }; message: string; }> {
        // TODO: Validate employee exists

        // TODO: Integration with Facilities/Admin Systems
        // TODO: Reserve equipment from inventory
        // TODO: Assign desk/workspace
        // TODO: Generate access card

        // TODO: Send notification to Facilities/Admin
        // TODO: Update onboarding task status for equipment reservation

        return {success: true, employeeId: dto.employeeId, reservedItems: {
            equipment: dto.equipment,
                deskNumber: dto.deskNumber,
                accessCardNumber: dto.accessCardNumber,
            },
            message: 'Equipment and resources reserved successfully. All items will be ready on Day 1.',
        };
    }

    // ============================================================
    // ONB-013: Schedule Access Revocation
    // ============================================================

    /**
     * ONB-013: As a HR Manager, I want automated account provisioning on start date
     * and scheduled revocation on exit, so access is consistent and secure.
     *
     * BR 9(b): IT allocation is automated
     * Links to Offboarding (OFF-007)
     */
    async scheduleAccessRevocation(dto: ScheduleAccessRevocationDto): Promise<{
        success: boolean;
        employeeId: string;
        revocationDate?: string;
        message: string;
    }> {
        // TODO: Validate employee exists

        // TODO: Store scheduled revocation in system
        // TODO: Create scheduled job for automatic revocation
        // TODO: Link to Offboarding module (OFF-007) for security control

        return {
            success: true,
            employeeId: dto.employeeId,
            revocationDate: dto.revocationDate,
            message: 'Access revocation scheduled successfully. Will be auto-executed on specified date or termination.',
        };
    }

    // ============================================================
    // ONB-018: Trigger Payroll Initiation
    // ============================================================

    /**
     * ONB-018: As a HR Manager, I want the system to automatically handle
     * payroll initiation based on the contract signing day for the current payroll cycle.
     *
     * BR 9(a): Auto onboarding tasks for HR (payroll & benefits creation)
     * REQ-PY-23: Automatically process payroll initiation
     */
    async triggerPayrollInitiation(dto: TriggerPayrollInitiationDto): Promise<{
        success: boolean;
        contractId: string;
        message: string;
        triggeredAt: Date;
    }> {
        const contract = await this.contractModel.findById(dto.contractId).exec();

        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        // TODO: Integration with Payroll Module (PY)
        // TODO: REQ-PY-23: Trigger payroll initiation
        // TODO: Create payroll entry based on contract signing date
        // TODO: Calculate pro-rated salary for current pay cycle
        // TODO: Setup benefits enrollment
        // TODO: Configure tax withholdings

        return {
            success: true,
            contractId: dto.contractId,
            message: 'Payroll initiation triggered successfully. employee added to current payroll cycle.',
            triggeredAt: new Date(),
        };
    }

    // ============================================================
    // ONB-019: Process Signing Bonuses
    // ============================================================

    /**
     * ONB-019: As a HR Manager, I want the system to automatically process
     * signing bonuses based on contract after a new hire is signed.
     *
     * BR 9(a): Bonuses as distinct payroll components
     * REQ-PY-27: Automatically process signing bonuses
     */
    async processSigningBonus(contractId: string): Promise<{
        success: boolean;
        contractId: string;
        bonusAmount: number;
        message: string;
    }> {
        const contract = await this.contractModel.findById(contractId).exec();

        if (!contract) {
            throw new NotFoundException(`Contract with ID ${contractId} not found`);
        }

        if (!contract.signingBonus || contract.signingBonus === 0) {
            throw new BadRequestException('No signing bonus specified in contract');
        }

        // TODO: Integration with Payroll Module (PY)
        // TODO: REQ-PY-27: Process signing bonus
        // TODO: Create bonus payment entry
        // TODO: Schedule bonus payment (first paycheck or separate payment)
        // TODO: Apply tax calculations to bonus

        return {
            success: true,
            contractId,
            bonusAmount: contract.signingBonus,
            message: `Signing bonus of ${contract.signingBonus} scheduled for processing.`,
        };
    }

    // ============================================================
    // ONB-020: Cancel Onboarding (No-Show)
    // ============================================================

    /**
     * BR20: The system should allow onboarding cancellation/termination
     * of the created employee profile in case of a "no show".
     */
    async cancelOnboarding(onboardingId: string, dto: CancelOnboardingDto): Promise<{
        success: boolean;
        onboardingId: string;
        message: string;
        cancelledAt: Date;
    }> {
        const onboarding = await this.onboardingModel.findById(onboardingId).exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
        }

        if (onboarding.completed) {
            throw new BadRequestException('Cannot cancel completed onboarding');
        }

        // TODO: Integration with employee Profile module
        // TODO: Terminate/deactivate employee profile
        // TODO: Revoke any provisioned access
        // TODO: Cancel equipment reservations
        // TODO: Remove from payroll
        // TODO: Notify relevant departments (IT, Admin, Payroll)

        await this.onboardingModel.findByIdAndDelete(onboardingId).exec();

        return {
            success: true,
            onboardingId,
            message: `Onboarding cancelled due to: ${dto.reason}. Employee profile terminated.`,
            cancelledAt: new Date(),
        };
    }

    /**
     * Get onboarding progress statistics
     */
    async getOnboardingProgress(onboardingId: string): Promise<{
        onboardingId: string;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        inProgressTasks: number;
        progressPercentage: number;
        isComplete: boolean;
    }> {
        const onboarding = await this.onboardingModel.findById(onboardingId).exec();

        if (!onboarding) {
            throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
        }

        const totalTasks = onboarding.tasks.length;
        const completedTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.COMPLETED).length;
        const pendingTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.PENDING).length;
        const inProgressTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.IN_PROGRESS).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            onboardingId,
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            progressPercentage,
            isComplete: onboarding.completed,
        };
    }
}

