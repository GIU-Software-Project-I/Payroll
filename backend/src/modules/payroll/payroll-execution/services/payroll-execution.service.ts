import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { employeeSigningBonus, employeeSigningBonusDocument } from '../models/EmployeeSigningBonus.schema';
import { BonusStatus } from '../enums/payroll-execution-enum';
@Injectable()
export class PayrollExecutionService {
    constructor(
        @InjectModel(employeeSigningBonus.name)
        private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
    ) {}
   
    // List signing bonuses (optionally filter by status)
    async listSigningBonuses(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        return this.employeeSigningBonusModel.find(filter).lean().exec();
    }

    async getSigningBonus(id: string) {
        return this.employeeSigningBonusModel.findById(id).lean().exec();
    }

    // Create an employee signing bonus record
    async createSigningBonus(dto: { employeeId: string; signingBonusId: string; paymentDate?: string }, createdBy?: string) {
        const doc: any = {
            employeeId: dto.employeeId,
            signingBonusId: dto.signingBonusId,
            status: BonusStatus.PENDING,
        };
        if (dto.paymentDate) {
            const d = new Date(dto.paymentDate);
            if (isNaN(d.getTime())) {
                throw new BadRequestException('Invalid paymentDate; expected ISO date string');
            }
            doc.paymentDate = d;
        }
        const created = await this.employeeSigningBonusModel.create(doc);
        return created;
    }

    // Edit signing bonus (amount, paymentDate (ISO string), status, note)
    async updateSigningBonus(
        id: string,
        dto: { status?: BonusStatus; paymentDate?: string; amount?: number; note?: string },
        updatedBy?: string,
    ) {
        const update: any = {};
        if (dto.status !== undefined) update.status = dto.status;
        if (dto.amount !== undefined) update.amount = dto.amount;
        if (dto.note !== undefined) update.note = dto.note;
        if (dto.paymentDate !== undefined) {
            const d = new Date(dto.paymentDate);
            if (isNaN(d.getTime())) {
                throw new BadRequestException('Invalid paymentDate; expected ISO date string');
            }
            update.paymentDate = d;
        }
        const doc = await this.employeeSigningBonusModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
        return doc;
    }

    // Approve a single signing bonus by id
    async approveSigningBonus(id: string, approvedBy?: string) {
        const now = new Date();
        const doc = await this.employeeSigningBonusModel.findByIdAndUpdate(
            id,
            { $set: { status: BonusStatus.APPROVED, paymentDate: now } },
            { new: true },
        ).exec();
        return doc;
    }

    // Bulk approve all signing bonuses currently in DRAFT status
    async approveSigningBonuses(approvedBy?: string) {
        const now = new Date();
        const res = await this.employeeSigningBonusModel.updateMany(
            { status: BonusStatus.PENDING },
            { $set: { status: BonusStatus.APPROVED, paymentDate: now } },
        ).exec();
        return {
            matchedCount: (res as any).matchedCount ?? (res as any).n ?? 0,
            modifiedCount: (res as any).modifiedCount ?? (res as any).nModified ?? 0,
            approvedAt: now,
        };
    }

    //  stubs  
    async initiatePayroll(dto: any, initiatedBy?: string) {
        return { id: `job-${Date.now()}` };
    }

    async getDraft(id: string, requestedBy?: string) {
        return { id, draft: true };
    }

    async approvePayroll(id: string, approvedBy?: string) {
        return { id, approvedBy };
    }

    async freezePayroll(id: string, by?: string) {
        return { id, frozenBy: by };
    }

    async unfreezePayroll(id: string, by?: string, reason?: string) {
        return { id, unfrozenBy: by, reason };
    }

    async generatePayslips(id: string, triggeredBy?: string) {
        return { id, generatedBy: triggeredBy };
    }

}
