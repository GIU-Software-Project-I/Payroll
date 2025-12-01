import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import mongoose from 'mongoose';
import { employeeSigningBonus, employeeSigningBonusDocument } from '../models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsDocument } from '../models/payrollRuns.schema';
import { PayrollDraftService } from './payroll-draft.service';
import { BonusStatus, BenefitStatus } from '../enums/payroll-execution-enum';
import { EmployeeTerminationResignation, EmployeeTerminationResignationDocument } from '../models/EmployeeTerminationResignation.schema';
import { SystemRole } from '../../../employee/enums/employee-profile.enums';
@Injectable()
export class PayrollExecutionService {
    constructor(
        @InjectModel(employeeSigningBonus.name)
        private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
        @InjectModel(EmployeeTerminationResignation.name)
        private employeeTerminationResignationModel: Model<EmployeeTerminationResignationDocument>,
        @InjectModel(payrollRuns.name)
        private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly payrollDraftService: PayrollDraftService,
    ) {}
    // Centralized DB handle and collection names
    private get db() {
        return (this.connection && this.connection.db) ? this.connection.db : (mongoose && mongoose.connection && (mongoose.connection.db as any)) || null;
    }
    private readonly terminationCollectionName = 'employeeterminationresignations';
    private readonly terminationRequestsCollectionName = 'terminationrequests';
    private readonly terminationBenefitsCollectionName = 'terminationandresignationbenefits';
   
    // List signing bonuses (optionally filter by status)
    async listSigningBonuses(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        return this.employeeSigningBonusModel.find(filter).lean().exec();
    }

    async getSigningBonus(id: string) {
        // Try standard Mongoose lookup first
        const doc = await this.employeeSigningBonusModel.findById(id).lean().exec();
        if (doc) return doc;

        // Fallback: attempt native DB lookup across common collection names
        const possibleExecNames = ['employeesigningbonuses', 'employee_signing_bonuses', 'employee_signingbonuses', 'employee_signing_bonus', 'employeeSigningBonuses', 'employeeSigningBonus'];
        const objectId = (() => {
            try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; }
        })();
        if (!objectId) return null;

        const db = this.db;
        if (!db) return null;

        for (const name of possibleExecNames) {
            try {
                const coll = db.collection(name as any);
                // try ObjectId lookup first
                let found: any = null;
                try { found = await coll.findOne({ _id: objectId } as any); } catch (e) { found = null; }
                if (found) return found;
                // fallback to string id lookup (some scripts may have inserted string _id values)
                found = await coll.findOne({ _id: id } as any);
                if (found) return found;
            } catch (err) {
                // ignore and continue
            }
        }
        return null;
    }

    // Edit signing bonus (amount, paymentDate (ISO string), status, note)
    async updateSigningBonus(
        id: string,
        dto: { status?: BonusStatus; paymentDate?: string; amount?: number; note?: string },
        updatedBy?: string,
    ) {
        await this.ensurePayrollSpecialist(updatedBy);
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
        await this.ensurePayrollSpecialist(approvedBy);
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
        await this.ensurePayrollSpecialist(approvedBy);
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
        // minimal implementation: create a payrollRuns document in DRAFT and return it
        const runId = dto.runId || `PR-${Date.now()}`;
        // parse and validate payrollPeriod
        let payrollPeriod: Date;
        if (dto.payrollPeriod) {
            payrollPeriod = new Date(dto.payrollPeriod);
            if (isNaN(payrollPeriod.getTime())) throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
        } else {
            payrollPeriod = new Date();
        }
        // payrollSpecialistId (createdBy fallback)
        const payrollSpecialistId = dto.payrollSpecialistId
            ? (typeof dto.payrollSpecialistId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(dto.payrollSpecialistId); } catch (e) { return dto.payrollSpecialistId; } })() : dto.payrollSpecialistId)
            : (initiatedBy ? (() => { try { return new mongoose.Types.ObjectId(initiatedBy); } catch (e) { return initiatedBy; } })() : null);

        // payrollManagerId: prefer provided, otherwise use specialist as placeholder to satisfy schema
        const payrollManagerId = dto.payrollManagerId
            ? (typeof dto.payrollManagerId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(dto.payrollManagerId); } catch (e) { return dto.payrollManagerId; } })() : dto.payrollManagerId)
            : payrollSpecialistId;

        const doc: any = {
            runId,
            payrollPeriod,
            status: dto.status || 'draft',
            entity: dto.entity || 'default',
            employees: dto.employees ?? 0,
            exceptions: dto.exceptions ?? 0,
            totalnetpay: dto.totalnetpay ?? 0,
            payrollSpecialistId,
            payrollManagerId,
            paymentStatus: dto.paymentStatus || 'pending',
        };
        const created = await this.payrollRunsModel.create(doc);
        return created;
    }

    async getDraft(id: string, requestedBy?: string) {
        return await this.payrollDraftService.getDraft(id);
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

    // Payroll Initiation persistence and lifecycle
    async createPayrollInitiation(dto: any, createdBy?: string) {
        await this.ensurePayrollSpecialist(createdBy);
        const runId = dto.runId || `PR-${Date.now()}`;
        // parse payrollPeriod
        let payrollPeriod: Date;
        if (dto.payrollPeriod) {
            payrollPeriod = new Date(dto.payrollPeriod);
            if (isNaN(payrollPeriod.getTime())) throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
        } else {
            payrollPeriod = new Date();
        }
        const payrollSpecialistId = createdBy ? (() => { try { return new mongoose.Types.ObjectId(createdBy); } catch (e) { return createdBy; } })() : null;
        // use createdBy as payrollManagerId placeholder if not provided
        const payrollManagerId = dto.payrollManagerId ? (typeof dto.payrollManagerId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(dto.payrollManagerId); } catch (e) { return dto.payrollManagerId; } })() : dto.payrollManagerId) : payrollSpecialistId;

        const doc: any = {
            runId,
            payrollPeriod,
            status: 'draft',
            entity: dto.entity || 'default',
            employees: dto.employees ?? 0,
            exceptions: dto.exceptions ?? 0,
            totalnetpay: dto.totalnetpay ?? 0,
            payrollSpecialistId,
            payrollManagerId,
            paymentStatus: 'pending',
        };
        const created = await this.payrollRunsModel.create(doc);
        return created;
    }

    async getPayrollInitiation(id: string) {
        try {
            const doc = await this.payrollRunsModel.findById(id).lean().exec();
            if (doc) return doc;
        } catch (e) {}
        const db = this.db;
        if (!db) return null;
        try {
            const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
            if (oid) return await db.collection('payrollruns').findOne({ _id: oid } as any);
            return await db.collection('payrollruns').findOne({ _id: id } as any);
        } catch (err) { return null; }
    }

    async updatePayrollInitiation(id: string, dto: any, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        // only allow edits when draft or rejected
        const existing: any = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) return null;
        if (existing.status !== 'draft' && existing.status !== 'rejected') {
            throw new BadRequestException('Only draft or rejected initiations can be edited');
        }
        const update: any = {};
        if (dto.payrollPeriod) update.payrollPeriod = new Date(dto.payrollPeriod);
        if (dto.entity) update.entity = dto.entity;
        if (dto.employees !== undefined) update.employees = dto.employees;
        if (dto.exceptions !== undefined) update.exceptions = dto.exceptions;
        if (dto.totalnetpay !== undefined) update.totalnetpay = dto.totalnetpay;
        if (dto.rejectionReason !== undefined) update.rejectionReason = dto.rejectionReason;
        // If the initiation was rejected and user edits it, move it back to draft so it can be re-reviewed
        if (existing.status === 'rejected') {
            update.status = 'draft';
            update.rejectionReason = null;
        }
        const updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
        // Reload the document to ensure we return the latest persisted state
        try {
            let reloaded = await this.getPayrollInitiation(id);
            const db = this.db;
            if (db && reloaded && (dto.exceptions !== undefined || dto.totalnetpay !== undefined)) {
                const needFix: any = {};
                if (dto.exceptions !== undefined && reloaded.exceptions !== dto.exceptions) needFix.exceptions = dto.exceptions;
                if (dto.totalnetpay !== undefined && reloaded.totalnetpay !== dto.totalnetpay) needFix.totalnetpay = dto.totalnetpay;
                if (Object.keys(needFix).length) {
                    const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
                    const filter = oid ? { _id: oid } : { _id: id };
                    await db.collection('payrollruns').updateOne(filter as any, { $set: needFix } as any);
                    reloaded = await this.getPayrollInitiation(id);
                }
            }
            return reloaded || updated;
        } catch (err) {
            // if reload or native update fails, fall back to returning Mongoose result
            return updated;
        }
    }

    async approvePayrollInitiation(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        // set status to 'under review' and trigger draft generation (minimal)
        const now = new Date();
        const updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: { status: 'under review', managerApprovalDate: now } }, { new: true }).exec();
        // trigger draft generation - minimal
        try {
            await this.payrollDraftService.generateDraft(updated, approvedBy ?? 'system');
        } catch (err) {
            // don't block approval on draft generation failure
        }
        return updated;
    }

    async rejectPayrollInitiation(id: string, rejectedBy?: string, reason?: string) {
        await this.ensurePayrollSpecialist(rejectedBy);
        const updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: { status: 'rejected', rejectionReason: reason || null } }, { new: true }).exec();
        return updated;
    }

    // Termination/Resignation benefits
    // Ensure the acting user is a Payroll Specialist. Services still prefer controller-level guards,
    // but this runtime check provides defense-in-depth when callers pass a user id.
    private async ensurePayrollSpecialist(userId?: string) {
        if (!userId) throw new ForbiddenException('Missing user id');
        const db = this.db;
        if (!db) throw new ForbiddenException('Database unavailable');
        let oid: any = null;
        try { oid = new mongoose.Types.ObjectId(userId); } catch (e) { oid = userId; }
        try {
            const roleRec: any = await db.collection('employee_system_roles').findOne({ employeeProfileId: oid } as any);
            if (!roleRec || !Array.isArray(roleRec.roles) || !roleRec.roles.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Action requires Payroll Specialist role');
            }
            return true;
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
            throw new ForbiddenException('Unable to verify user roles');
        }
    }
    async listTerminationBenefits(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        // prefer Mongoose model for EmployeeTerminationResignation
        try {
            return await this.employeeTerminationResignationModel.find(filter).lean().exec();
        } catch (e) {
            // fallback to native collection
                const db = this.db;
                if (!db) return [];
                const coll = db.collection(this.terminationCollectionName as any);
                return await coll.find(filter).limit(100).toArray();
        }
    }

    async getTerminationBenefit(id: string) {
        // use the EmployeeTerminationResignation model if available
        try {
            const model = (this as any).employeeTerminationResignationModel as any;
            if (model) {
                const doc = await model.findById(id).lean().exec();
                if (doc) return doc;
            }
        } catch (e) {
            // ignore
        }

        // Fallback: try native lookup in canonical collection
        let objectId: any = null;
        try { objectId = new mongoose.Types.ObjectId(id); } catch (e) { objectId = null; }
        const db = this.db;
        if (!db) return null;
        const coll = db.collection(this.terminationCollectionName as any);
        try {
            if (objectId) {
                const found = await coll.findOne({ _id: objectId } as any);
                if (found) return found;
            }
            const found2 = await coll.findOne({ _id: id } as any);
            return found2;
        } catch (err) {
            return null;
        }
    }

    async updateTerminationBenefit(id: string, dto: { givenAmount?: number; status?: BenefitStatus; note?: string }, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        // try using Mongoose model if available
        try {
            const model = (this as any).employeeTerminationResignationModel as any;
            if (model) {
                const update: any = {};
                if (dto.givenAmount !== undefined) update.givenAmount = dto.givenAmount;
                if (dto.status !== undefined) update.status = dto.status;
                if (dto.note !== undefined) update.note = dto.note;
                const doc = await model.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
                return doc;
            }
        } catch (e) {
            // ignore
        }

        // Fallback native update
        const db = this.db;
        const coll = db.collection(this.terminationCollectionName as any);
        const updateObj: any = {};
        if (dto.givenAmount !== undefined) updateObj.givenAmount = dto.givenAmount;
        if (dto.status !== undefined) updateObj.status = dto.status;
        if (dto.note !== undefined) updateObj.note = dto.note;
        // attempt ObjectId update first, fallback to string _id
        try {
            const oid = new mongoose.Types.ObjectId(id);
            const res = await coll.updateOne({ _id: oid } as any, { $set: updateObj } as any);
            if (res && (res.modifiedCount || res.matchedCount)) {
                return await coll.findOne({ _id: oid } as any);
            }
        } catch (err) {
            // invalid ObjectId, fall through to string-id fallback
        }
        await coll.updateOne({ _id: id } as any, { $set: updateObj } as any);
        return await coll.findOne({ _id: id } as any);
    }

    async approveTerminationBenefit(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        const now = new Date();
        try {
            const model = (this as any).employeeTerminationResignationModel as any;
            if (model) {
                const doc = await model.findByIdAndUpdate(id, { $set: { status: BenefitStatus.APPROVED, approvedAt: now } }, { new: true }).exec();
                return doc;
            }
        } catch (e) {}
        const db = this.db;
        const coll = db.collection(this.terminationCollectionName as any);
        try {
            const oid = new mongoose.Types.ObjectId(id);
            const res = await coll.updateOne({ _id: oid } as any, { $set: { status: 'approved', approvedAt: now } } as any);
            if (res && (res.modifiedCount || res.matchedCount)) {
                return await coll.findOne({ _id: oid } as any);
            }
        } catch (err) {
            // invalid ObjectId, try string-id fallback
        }
        await coll.updateOne({ _id: id } as any, { $set: { status: 'approved', approvedAt: now } } as any);
        return await coll.findOne({ _id: id } as any);
    }

}
