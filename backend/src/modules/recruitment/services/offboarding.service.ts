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

    private validateObjectId(id: string, fieldName: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid ${fieldName} format: ${id}`);
        }
    }

    private readonly validStatusTransitions: Record<TerminationStatus, TerminationStatus[]> = {
        [TerminationStatus.PENDING]: [TerminationStatus.UNDER_REVIEW, TerminationStatus.REJECTED],
        [TerminationStatus.UNDER_REVIEW]: [TerminationStatus.APPROVED, TerminationStatus.REJECTED],
        [TerminationStatus.APPROVED]: [],
        [TerminationStatus.REJECTED]: [],
    };

    async createTerminationRequest(dto: CreateTerminationRequestDto): Promise<TerminationRequest> {
        this.validateObjectId(dto.employeeId, 'employeeId');
        this.validateObjectId(dto.contractId, 'contractId');

        const contract = await this.contractModel.findById(dto.contractId).exec();
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        const existingActiveRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: { $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW] }
        }).exec();

        if (existingActiveRequest) {
            throw new ConflictException('An active termination request already exists for this employee');
        }

        const existingApprovedRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: TerminationStatus.APPROVED
        }).exec();

        if (existingApprovedRequest) {
            throw new ConflictException('Employee already has an approved termination request');
        }

        if (dto.terminationDate) {
            const terminationDate = new Date(dto.terminationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (terminationDate < today) {
                throw new BadRequestException('Termination date cannot be in the past');
            }
        }

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

        return terminationRequest.save();
    }

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

    async getAllResignationRequests(status?: TerminationStatus): Promise<TerminationRequest[]> {
        return this.getTerminationRequestsByInitiator(TerminationInitiation.EMPLOYEE, status);
    }

    async getTerminationRequestsByStatus(status: TerminationStatus): Promise<TerminationRequest[]> {
        return this.terminationRequestModel
            .find({ status })
            .populate('contractId')
            .sort({ createdAt: -1 })
            .exec();
    }

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

    async updateTerminationStatus(id: string, dto: UpdateTerminationStatusDto): Promise<TerminationRequest> {
        this.validateObjectId(id, 'id');

        const request = await this.terminationRequestModel.findById(id).exec();

        if (!request) {
            throw new NotFoundException(`Termination request with ID ${id} not found`);
        }

        const currentStatus = request.status;
        const newStatus = dto.status;
        const allowedTransitions = this.validStatusTransitions[currentStatus];

        if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
                `Allowed transitions: ${allowedTransitions?.join(', ') || 'none (status is final)'}`
            );
        }

        request.status = dto.status;

        if (dto.hrComments) {
            request.hrComments = dto.hrComments;
        }

        return request.save();
    }

    async createResignationRequest(dto: CreateResignationRequestDto): Promise<TerminationRequest> {
        this.validateObjectId(dto.employeeId, 'employeeId');
        this.validateObjectId(dto.contractId, 'contractId');

        const contract = await this.contractModel.findById(dto.contractId).exec();
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
        }

        const existingActiveRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: { $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW] }
        }).exec();

        if (existingActiveRequest) {
            throw new ConflictException('An active resignation/termination request already exists');
        }

        const existingApprovedRequest = await this.terminationRequestModel.findOne({
            employeeId: new Types.ObjectId(dto.employeeId),
            status: TerminationStatus.APPROVED
        }).exec();

        if (existingApprovedRequest) {
            throw new ConflictException('Employee already has an approved termination/resignation request');
        }

        if (dto.terminationDate) {
            const terminationDate = new Date(dto.terminationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (terminationDate < today) {
                throw new BadRequestException('Termination date cannot be in the past');
            }
        }

        const resignationRequest = new this.terminationRequestModel({
            employeeId: new Types.ObjectId(dto.employeeId),
            initiator: TerminationInitiation.EMPLOYEE,
            reason: dto.reason,
            employeeComments: dto.employeeComments,
            status: TerminationStatus.PENDING,
            terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
            contractId: new Types.ObjectId(dto.contractId),
        });

        return resignationRequest.save();
    }

    async getResignationRequestByEmployeeId(employeeId: string): Promise<TerminationRequest[]> {
        this.validateObjectId(employeeId, 'employeeId');

        return this.terminationRequestModel.find({employeeId: new Types.ObjectId(employeeId), initiator: TerminationInitiation.EMPLOYEE}).sort({ createdAt: -1 }).exec();
    }

    async createClearanceChecklist(dto: CreateClearanceChecklistDto): Promise<ClearanceChecklist> {
        this.validateObjectId(dto.terminationId, 'terminationId');

        const termination = await this.terminationRequestModel.findById(dto.terminationId).exec();
        if (!termination) {
            throw new NotFoundException(`Termination request with ID ${dto.terminationId} not found`);
        }

        if (termination.status !== TerminationStatus.APPROVED) {
            throw new BadRequestException('Clearance checklist can only be created for approved termination requests');
        }

        const existingChecklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new Types.ObjectId(dto.terminationId) })
            .exec();

        if (existingChecklist) {
            throw new ConflictException('Clearance checklist already exists for this termination request');
        }

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
    }

    async getClearanceChecklistByTerminationId(terminationId: string): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new Types.ObjectId(terminationId) })
            .populate('terminationId')
            .exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist not found for termination request ${terminationId}`);
        }

        return checklist;
    }

    async getClearanceChecklistById(id: string): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel
            .findById(id)
            .populate('terminationId')
            .exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${id} not found`);
        }

        return checklist;
    }

    async updateClearanceItem(checklistId: string, dto: UpdateClearanceItemDto): Promise<ClearanceChecklist> {
        this.validateObjectId(checklistId, 'checklistId');

        const checklist = await this.clearanceChecklistModel.findById(checklistId).populate('terminationId').exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        const termination = await this.terminationRequestModel.findById(checklist.terminationId).exec();
        if (!termination || termination.status !== TerminationStatus.APPROVED) {
            throw new BadRequestException('Cannot update clearance items for non-approved termination requests');
        }

        const itemIndex = checklist.items.findIndex(item => item.department === dto.department);

        if (itemIndex === -1) {
            throw new NotFoundException(`Department ${dto.department} not found in clearance checklist`);
        }

        checklist.items[itemIndex] = {
            department: dto.department,
            status: dto.status,
            comments: dto.comments || checklist.items[itemIndex].comments,
            updatedBy: new Types.ObjectId(dto.updatedBy),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        };

        const updated = await checklist.save();

        const allApproved = checklist.items.every(item => item.status === ApprovalStatus.APPROVED);

        // TODO: If all approved and all equipment returned, trigger final settlement notification
        if (allApproved) {
            // TODO: Notify HR that clearance is complete
            // TODO: Enable final settlement processing
        }

        return updated;
    }

    async updateEquipmentItem(checklistId: string, equipmentName: string, dto: UpdateEquipmentItemDto): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        const equipmentIndex = checklist.equipmentList.findIndex(item => item.name === equipmentName);

        if (equipmentIndex === -1) {
            throw new NotFoundException(`Equipment ${equipmentName} not found in clearance checklist`);
        }

        checklist.equipmentList[equipmentIndex] = {
            equipmentId: dto.equipmentId ? new Types.ObjectId(dto.equipmentId) : checklist.equipmentList[equipmentIndex].equipmentId,
            name: dto.name,
            returned: dto.returned,
            condition: dto.condition || checklist.equipmentList[equipmentIndex].condition,
        };

        return checklist.save();
    }

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

    async updateCardReturn(checklistId: string, cardReturned: boolean): Promise<ClearanceChecklist> {
        const checklist = await this.clearanceChecklistModel.findById(checklistId).exec();

        if (!checklist) {
            throw new NotFoundException(`Clearance checklist with ID ${checklistId} not found`);
        }

        checklist.cardReturned = cardReturned;

        return checklist.save();
    }

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
    }

    async revokeSystemAccess(dto: RevokeAccessDto): Promise<{
        success: boolean;
        employeeId: string;
        message: string;
        revokedAt: Date;
    }> {
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

    async triggerFinalSettlement(dto: TriggerFinalSettlementDto): Promise<{
        success: boolean;
        terminationId: string;
        message: string;
        triggeredAt: Date;
    }> {
        this.validateObjectId(dto.terminationId, 'terminationId');

        const terminationRequest = await this.terminationRequestModel
            .findById(dto.terminationId)
            .exec();

        if (!terminationRequest) {
            throw new NotFoundException(`Termination request with ID ${dto.terminationId} not found`);
        }

        if (terminationRequest.status !== TerminationStatus.APPROVED) {
            throw new BadRequestException('Final settlement can only be triggered for approved termination requests');
        }

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

    async getAllClearanceChecklists(): Promise<ClearanceChecklist[]> {
        return this.clearanceChecklistModel
            .find()
            .populate('terminationId')
            .sort({ createdAt: -1 })
            .exec();
    }

    async deleteTerminationRequest(id: string): Promise<{ message: string; deletedId: string }> {
        const request = await this.terminationRequestModel.findById(id).exec();

        if (!request) {
            throw new NotFoundException(`Termination request with ID ${id} not found`);
        }

        if (request.status === TerminationStatus.APPROVED) {
            throw new BadRequestException('Cannot delete an approved termination request');
        }

        await this.terminationRequestModel.findByIdAndDelete(id).exec();

        await this.clearanceChecklistModel.deleteOne({ terminationId: new Types.ObjectId(id) }).exec();

        return {message: 'Termination request deleted successfully', deletedId: id,};
    }
}

