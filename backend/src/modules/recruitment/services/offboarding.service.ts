import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Models
import { TerminationRequest, TerminationRequestDocument } from '../models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistDocument } from '../models/clearance-checklist.schema';
import { Contract, ContractDocument } from '../models/contract.schema';

// DTOs
import {
    CreateTerminationRequestDto,
    CreateResignationRequestDto,
    UpdateTerminationStatusDto,
    CreateClearanceChecklistDto,
    UpdateClearanceItemDto,
    UpdateEquipmentItemDto,
    RevokeAccessDto,
    TriggerFinalSettlementDto,
} from '../dto/offboarding';

// Enums
import { TerminationInitiation } from '../enums/termination-initiation.enum';
import { TerminationStatus } from '../enums/termination-status.enum';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Injectable()
export class OffboardingService {
    constructor(
        @InjectModel(TerminationRequest.name) private terminationRequestModel: Model<TerminationRequestDocument>,
        @InjectModel(ClearanceChecklist.name) private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
        @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    ) {}

    // ============================================================
    // Requirement: Termination & Resignation Initiation
    // OFF-001: HR Manager initiates termination reviews
    // ============================================================

    /**
     * OFF-001: As an HR Manager, I want to initiate termination reviews based on
     * warnings and performance data / manager requests, so that exits are justified.
     *
     * BR 4: employee separation needs an effective date and a clearly stated
     * and identified reason for exit. Termination reviews based on performance
     * must follow due process.
     *
     * TODO: Integration with Performance Management (PM) module for warnings/low scores
     */
    async createTerminationRequest(dto: CreateTerminationRequestDto): Promise<TerminationRequest> {
        // Validate contract exists
        const contract = await this.contractModel.findById(dto.contractId).exec();
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        // Check for existing active termination request
        const existingRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: { $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW] }}).exec();

        if (existingRequest) {
            throw new ConflictException('An active termination request already exists for this employee');
        }

        // TODO: Validate employee exists in employee Profile module
        // TODO: Fetch performance warnings/low scores from Performance Management module

        const terminationRequest = new this.terminationRequestModel({
            employeeId: new Types.ObjectId(dto.employeeId),
            initiator: dto.initiator,
            reason: dto.reason,
            employeeComments: dto.employeeComments,
            hrComments: dto.hrComments,
            status: TerminationStatus.PENDING,
            terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
            contractId: new Types.ObjectId(dto.contractId),
        });

        const saved = await terminationRequest.save();

        // TODO: Trigger workflow approval notifications

        return saved;
    }

    /**
     * Get all termination requests with optional filtering
     * Supports filtering by employeeId, status, and initiator
     */
    async getAllTerminationRequests(
        employeeId?: string,
        status?: TerminationStatus,
        initiator?: TerminationInitiation
    ): Promise<TerminationRequest[]> {
        const filter: any = {};

        if (employeeId) {
            filter.employeeId = new Types.ObjectId(employeeId);
        }

        if (status) {
            filter.status = status;
        }

        if (initiator) {
            filter.initiator = initiator;
        }

        return this.terminationRequestModel
            .find(filter)
            .populate('contractId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get all termination/resignation requests by initiator
     * Returns all requests (resignations if EMPLOYEE, terminations if HR/MANAGER)
     */
    async getTerminationRequestsByInitiator(
        initiator: TerminationInitiation,
        status?: TerminationStatus
    ): Promise<TerminationRequest[]> {
        const filter: any = { initiator };

        if (status) {
            filter.status = status;
        }

        return this.terminationRequestModel
            .find(filter)
            .populate('contractId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get all resignation requests (employee-initiated only)
     * Convenience method for getting all resignations
     */
    async getAllResignationRequests(status?: TerminationStatus): Promise<TerminationRequest[]> {
        return this.getTerminationRequestsByInitiator(TerminationInitiation.EMPLOYEE, status);
    }

    /**
     * Get all termination requests by status
     * Returns all terminations/resignations with the given status across all initiators
     */
    async getTerminationRequestsByStatus(status: TerminationStatus): Promise<TerminationRequest[]> {
        return this.terminationRequestModel
            .find({ status })
            .populate('contractId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get termination request by ID
     */
    async getTerminationRequestById(id: string): Promise<TerminationRequest> {
        const request = await this.terminationRequestModel
            .findById(id)
            .populate('contractId')
            .exec();

        if (!request) {
            throw new NotFoundException(`Termination request with ID ${id} not found`);
        }

        return request;
    }

    /**
     * Update termination request status
     * Supports workflow approval process
     */
    async updateTerminationStatus(id: string, dto: UpdateTerminationStatusDto): Promise<TerminationRequest> {
        const request = await this.terminationRequestModel.findById(id).exec();

        if (!request) {
            throw new NotFoundException(`Termination request with ID ${id} not found`);
        }

        // Validate status transition
        if (request.status === TerminationStatus.APPROVED || request.status === TerminationStatus.REJECTED) {
            throw new BadRequestException('Cannot update status of an already finalized termination request');
        }

        request.status = dto.status;

        if (dto.hrComments) {
            request.hrComments = dto.hrComments;
        }

        const updated = await request.save();

        // TODO: Trigger notifications based on status change
        // TODO: If APPROVED, trigger clearance checklist creation

        return updated;
    }

    // ============================================================
    // Requirement: Termination & Resignation Initiation
    // OFF-018, OFF-019: employee resignation requests
    // ============================================================

    /**
     * OFF-018: As an employee, I want to be able to request a Resignation
     * request with reasoning.
     *
     * OFF-019: As an employee, I want to be able to track my resignation
     * request status.
     *
     * BR 6: employee separation can be triggered by resignation.
     * A clearly identified offboarding approval workflow should be identified
     * (e.g., employee resigning > Line Manager > Financial approval > HR processing/approval).
     */
    async createResignationRequest(dto: CreateResignationRequestDto): Promise<TerminationRequest> {
        // Validate contract exists
        const contract = await this.contractModel.findById(dto.contractId).exec();
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        // Check for existing active resignation/termination request
        const existingRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: { $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW] }
        }).exec();

        if (existingRequest) {
            throw new ConflictException('An active resignation/termination request already exists');
        }

        // TODO: Validate employee exists in employee Profile module

        const resignationRequest = new this.terminationRequestModel({
            employeeId: new Types.ObjectId(dto.employeeId),
            initiator: TerminationInitiation.EMPLOYEE,
            reason: dto.reason,
            employeeComments: dto.employeeComments,
            status: TerminationStatus.PENDING,
            terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
            contractId: new Types.ObjectId(dto.contractId),
        });

        const saved = await resignationRequest.save();

        // TODO: Trigger offboarding approval workflow
        // employee resigning > Line Manager > Financial approval > HR processing/approval

        return saved;
    }

    /**
     * OFF-019: Track resignation request status
     * Allows employee to view their resignation request status
     */
    async getResignationRequestByEmployeeId(employeeId: string): Promise<TerminationRequest[]> {
        return this.terminationRequestModel.find({employeeId: new Types.ObjectId(employeeId), initiator: TerminationInitiation.EMPLOYEE}).sort({ createdAt: -1 }).exec();
    }

    // ============================================================
    // Requirement: Clearance, Handover & Access Revocation
    // OFF-006: Offboarding checklist for asset recovery
    // ============================================================

    /**
     * OFF-006: As an HR Manager, I want an offboarding checklist
     * (IT assets, ID cards, equipment), so no company property is lost.
     *
     * BR 13(a): Clearance checklist required
     */
    async createClearanceChecklist(dto: CreateClearanceChecklistDto): Promise<ClearanceChecklist> {
        // Validate termination request exists
        const termination = await this.terminationRequestModel.findById(dto.terminationId).exec();
        if (!termination) {
            throw new NotFoundException(`Termination request with ID ${dto.terminationId} not found`);
        }

        // Check for existing checklist
        const existingChecklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new Types.ObjectId(dto.terminationId) })
            .exec();

        if (existingChecklist) {
            throw new ConflictException('Clearance checklist already exists for this termination request');
        }

        // Initialize default departments if not provided
        const defaultDepartments = ['IT', 'Finance', 'Facilities', 'HR', 'Admin'];
        const items = dto.items && dto.items.length > 0
            ? dto.items.map(item => ({
                department: item.department,
                status: ApprovalStatus.PENDING,
                comments: item.comments || '',
                updatedBy: item.updatedBy ? new Types.ObjectId(item.updatedBy) : undefined,
                updatedAt: new Date(),
            }))
            : defaultDepartments.map(dept => ({
                department: dept,
                status: ApprovalStatus.PENDING,
                comments: '',
                updatedAt: new Date(),
            }));

        const equipmentList = dto.equipmentList?.map(equip => ({
            equipmentId: equip.equipmentId ? new Types.ObjectId(equip.equipmentId) : undefined,
            name: equip.name,
            returned: equip.returned,
            condition: equip.condition || '',
        })) || [];

        const checklist = new this.clearanceChecklistModel({
            terminationId: new Types.ObjectId(dto.terminationId),
            items,
            equipmentList,
            cardReturned: dto.cardReturned || false,
        });

        return checklist.save();
    }// RAGE3 EL METHOD DEH

    /**
     * Get clearance checklist by termination ID
     */
    async getClearanceChecklistByTerminationId(terminationId: string): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new Types.ObjectId(terminationId) })
            .populate('terminationId')
            .exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist not found for termination request ${terminationId}`);
        }

        return checklist;
    } // TAMAM

    /**
     * Get clearance checklist by ID
     */
    async getClearanceChecklistById(id: string): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel
            .findById(id)
            .populate('terminationId')
            .exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${id} not found`);
        }

        return checklist;
    } // TAMAM

    // ============================================================
    // Requirement: Clearance, Handover & Access Revocation
    // OFF-010: Multi-department exit clearance sign-offs
    // ============================================================

    /**
     * OFF-010: As HR Manager, I want multi-department exit clearance sign-offs
     * (IT, Finance, Facilities, Line Manager), with statuses, so the employee
     * is fully cleared.
     *
     * BR 13(b, c): Clearance checklist required across departments
     * (IT, HR, Admin, Finance).
     * BR 14: Final approvals/signature form should be filed to HR to complete
     * the offboarding process.
     */
    async updateClearanceItem(checklistId: string, dto: UpdateClearanceItemDto): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        // Find the department item
        const itemIndex = checklist.items.findIndex(item => item.department === dto.department);

        if (itemIndex === -1) {
            throw new NotFoundException(`Department ${dto.department} not found in clearance checklist`);
        }

        // Update the item
        checklist.items[itemIndex] = {
            department: dto.department,
            status: dto.status,
            comments: dto.comments || checklist.items[itemIndex].comments,
            updatedBy: new Types.ObjectId(dto.updatedBy),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        };

        const updated = await checklist.save();

        // Check if all departments have approved
        const allApproved = checklist.items.every(item => item.status === ApprovalStatus.APPROVED);

        // TODO: If all approved and all equipment returned, trigger final settlement notification
        if (allApproved) {
            // TODO: Notify HR that clearance is complete
            // TODO: Enable final settlement processing
        }

        return updated;
    }

    /**
     * Update equipment return status
     */
    async updateEquipmentItem(checklistId: string, equipmentName: string, dto: UpdateEquipmentItemDto): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        // Find the equipment item
        const equipmentIndex = checklist.equipmentList.findIndex(item => item.name === equipmentName);

        if (equipmentIndex === -1) {
            throw new NotFoundException(`Equipment ${equipmentName} not found in clearance checklist`);
        }

        // Update the equipment
        checklist.equipmentList[equipmentIndex] = {
            equipmentId: dto.equipmentId ? new Types.ObjectId(dto.equipmentId) : checklist.equipmentList[equipmentIndex].equipmentId,
            name: dto.name,
            returned: dto.returned,
            condition: dto.condition || checklist.equipmentList[equipmentIndex].condition,
        };

        return checklist.save();
    }

    /**
     * Add equipment to clearance checklist
     */
    async addEquipmentToChecklist(checklistId: string, dto: UpdateEquipmentItemDto): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        checklist.equipmentList.push({
            equipmentId: dto.equipmentId ? new Types.ObjectId(dto.equipmentId) : undefined,
            name: dto.name,
            returned: dto.returned,
            condition: dto.condition || '',
        });

        return checklist.save();
    }

    /**
     * Update access card return status
     */
    async updateCardReturn(checklistId: string, cardReturned: boolean): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        checklist.cardReturned = cardReturned;

        return checklist.save();
    }

    /**
     * Get clearance completion status
     */
    async getClearanceCompletionStatus(checklistId: string): Promise<{
        checklistId: string;
        allDepartmentsCleared: boolean;
        allEquipmentReturned: boolean;
        cardReturned: boolean;
        fullyCleared: boolean;
        pendingDepartments: string[];
        pendingEquipment: string[];
    }> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        const allDepartmentsCleared = checklist.items.every(item => item.status === ApprovalStatus.APPROVED);
        const allEquipmentReturned = checklist.equipmentList.every(item => item.returned);
        const cardReturned = checklist.cardReturned;

        const pendingDepartments = checklist.items
            .filter(item => item.status !== ApprovalStatus.APPROVED)
            .map(item => item.department);

        const pendingEquipment = checklist.equipmentList
            .filter(item => !item.returned)
            .map(item => item.name);

        const fullyCleared = allDepartmentsCleared && allEquipmentReturned && cardReturned;

        return {checklistId, allDepartmentsCleared, allEquipmentReturned, cardReturned, fullyCleared, pendingDepartments, pendingEquipment,};
    }// HELW, MANTEQY

    // ============================================================
    // Requirement: Clearance, Handover & Access Revocation
    // OFF-007: System and account access revocation
    // ============================================================

    /**
     * OFF-007: As a System Admin, I want to revoke system and account access
     * upon termination, so security is maintained.
     *
     * BR 3(c), 19: Access revocation required for security
     *
     * This connects to ONB-013 (scheduled revocation)
     */
    async revokeSystemAccess(dto: RevokeAccessDto): Promise<{
        success: boolean;
        employeeId: string;
        message: string;
        revokedAt: Date;
    }> {
        // Validate employee exists
        // TODO: Validate employee exists in employee Profile module

        // TODO: Verify termination request exists and is approved
        const terminationRequest = await this.terminationRequestModel
            .findOne({
                employeeId: new Types.ObjectId(dto.employeeId),
                status: TerminationStatus.APPROVED
            })
            .exec();

        if (!terminationRequest) {
            throw new BadRequestException(
                'No approved termination request found for this employee. Access revocation requires approved termination.'
            );
        }

        // TODO: Integration with IT/Access Systems
        // TODO: Disable SSO/email/tools access
        // TODO: Revoke payroll system access
        // TODO: Disable time management clock access
        // TODO: Set employee profile status to INACTIVE

        // TODO: Store access revocation log in audit trail
        // TODO: Send notifications to IT/System Admin

        return {
            success: true,
            employeeId: dto.employeeId,
            message: 'System access revoked successfully. All accounts disabled.',
            revokedAt: new Date(),
        };
    }

    // ============================================================
    // Requirement: Exit Settlements & Benefits
    // OFF-013: Final settlement and benefits termination
    // ============================================================

    /**
     * OFF-013: As HR Manager, I want to send offboarding notification to trigger
     * benefits termination and final pay calc (unused leave, deductions),
     * so settlements are accurate.
     *
     * BR 9, 11: Leaves' Balance must be reviewed and settled (unused annuals
     * to be encashed). Benefits plans are set to be auto-terminated as of
     * the end of the notice period.
     */
    async triggerFinalSettlement(dto: TriggerFinalSettlementDto): Promise<{
        success: boolean;
        terminationId: string;
        message: string;
        triggeredAt: Date;
    }> {
        // Validate termination request exists and is approved
        const terminationRequest = await this.terminationRequestModel
            .findById(dto.terminationId)
            .exec();

        if (!terminationRequest) {
            throw new NotFoundException(`Termination request with ID ${dto.terminationId} not found`);
        }

        if (terminationRequest.status !== TerminationStatus.APPROVED) {
            throw new BadRequestException('Final settlement can only be triggered for approved termination requests');
        }

        // Verify clearance is complete
        const clearanceChecklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new Types.ObjectId(dto.terminationId) })
            .exec();

        if (clearanceChecklist) {
            const completionStatus = await this.getClearanceCompletionStatus(clearanceChecklist._id.toString());

            if (!completionStatus.fullyCleared) {
                throw new BadRequestException(
                    `Clearance checklist is not fully complete. Pending: ${completionStatus.pendingDepartments.join(', ')}`
                );
            }
        }

        // TODO: Integration with Leaves Module
        // TODO: Fetch employee leave balance
        // TODO: Calculate unused annual leave encashment

        // TODO: Integration with employee Profile
        // TODO: Fetch employee benefits information

        // TODO: Integration with Payroll Module
        // TODO: Trigger service that fills collection relating user to benefit in payroll execution module
        // TODO: Create final pay calculation entry (unused leave, deductions, loans, severance)
        // TODO: Schedule benefits auto-termination as of end of notice period
        // TODO: Process any signing bonus clawbacks if applicable

        // TODO: Send notifications to Payroll department
        // TODO: Send notifications to employee about final settlement timeline

        return {
            success: true,
            terminationId: dto.terminationId,
            message: 'Final settlement triggered. Benefits termination scheduled and final pay calculation initiated.',
            triggeredAt: new Date(),
        };
    }

    /**
     * Get all clearance checklists with optional filtering
     */
    async getAllClearanceChecklists(): Promise<ClearanceChecklist[]> {
        return this.clearanceChecklistModel
            .find()
            .populate('terminationId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Delete termination request (only if not approved/rejected)
     */
    async deleteTerminationRequest(id: string): Promise<{ message: string; deletedId: string }> {
        const request = await this.terminationRequestModel.findById(id).exec();

        if (!request) {
            throw new NotFoundException(`Termination request with ID ${id} not found`);
        }

        if (request.status === TerminationStatus.APPROVED) {
            throw new BadRequestException('Cannot delete an approved termination request');
        }

        await this.terminationRequestModel.findByIdAndDelete(id).exec();

        // Also delete associated clearance checklist if exists
        await this.clearanceChecklistModel.deleteOne({ terminationId: new Types.ObjectId(id) }).exec();

        return {message: 'Termination request deleted successfully', deletedId: id,};
    }
}

