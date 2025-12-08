import { Injectable, BadRequestException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import mongoose from 'mongoose';
import { employeeSigningBonus, employeeSigningBonusDocument } from '../models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsDocument } from '../models/payrollRuns.schema';
import { paySlip } from '../models/payslip.schema';
import { employeePayrollDetails } from '../models/employeePayrollDetails.schema';
import { BonusStatus } from '../enums/payroll-execution-enum';
import { EmployeeTerminationResignation, EmployeeTerminationResignationDocument } from '../models/EmployeeTerminationResignation.schema';
import { SystemRole } from '../../../employee/enums/employee-profile.enums';
import { PayCalculatorService } from '../services/payCalculator.service';
import { TimeManagementService } from '../../../time-management/services/time-management.service';
import { LeavesService } from '../../../leaves/services/leaves.service';

import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../../employee/models/Employee/employee-system-role.schema';
import {EmployeeProfileService} from "../../../employee/Services/Employee-Profile.Service";

@Injectable()
export class PayrollExecutionService {
    constructor(
        @InjectModel(employeeSigningBonus.name)
        private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
        @InjectModel(EmployeeTerminationResignation.name)
        private employeeTerminationResignationModel: Model<EmployeeTerminationResignationDocument>,
        @InjectModel(payrollRuns.name)
        private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectModel(paySlip.name)
        private paySlipModel: Model<any>,
        @InjectModel(employeePayrollDetails.name)
        private employeePayrollDetailsModel: Model<any>,
        private readonly payCalculator: PayCalculatorService,
        @InjectConnection()
        private readonly connection: Connection,
        @Optional() private readonly employeeService?: EmployeeProfileService,
        @Optional() private readonly timeService?: TimeManagementService,
        @Optional() private readonly leavesService?: LeavesService,
        @Optional() @InjectModel(EmployeeSystemRole.name) private readonly employeeSystemRoleModel?: Model<EmployeeSystemRoleDocument>,
    ) {}

    private get db() {
        return (this.connection && this.connection.db) ? this.connection.db : (mongoose && mongoose.connection && (mongoose.connection.db as any)) || null;
    }

    private readonly terminationCollectionName = 'employeeterminationresignations';

    private async ensurePayrollSpecialist(userId?: string | any) {
        console.log('[payroll-exec] ensurePayrollSpecialist called with userId=', userId);
        if (!userId) return true;
        const db = this.db;
        if (!db) return true;
        try {
            const uid = typeof userId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(userId); } catch (e) { return userId; } })() : userId;
            // Prefer the injected Mongoose model if available
            if (this.employeeSystemRoleModel) {
                console.log('[payroll-exec] querying employeeSystemRoleModel for', uid);
                const r = await this.employeeSystemRoleModel.findOne({ employeeProfileId: uid, isActive: true }).lean().exec();
                console.log('[payroll-exec] employeeSystemRoleModel result=', r);
                if (!r) {
                    console.log('[payroll-exec] no role doc found via model');
                    throw new ForbiddenException('User not authorized');
                }
                if (!Array.isArray(r.roles)) {
                    console.log('[payroll-exec] role doc roles not an array', r.roles);
                    throw new ForbiddenException('User not authorized');
                }
                if (!r.roles.includes(SystemRole.PAYROLL_SPECIALIST)) {
                    console.log('[payroll-exec] role doc does not include Payroll Specialist', r.roles);
                    throw new ForbiddenException('User not authorized');
                }
                return true;
            }

            // Fallback to raw DB query
            console.log('[payroll-exec] using raw DB fallback, querying employee_system_roles for', uid);
            const row = await db.collection('employee_system_roles').findOne({ employeeProfileId: uid });
            console.log('[payroll-exec] raw DB row=', row);
            if (!row) {
                console.log('[payroll-exec] raw DB: no role row found');
                throw new ForbiddenException('User not authorized');
            }
            if (!row.roles || !Array.isArray(row.roles)) {
                console.log('[payroll-exec] raw DB: roles missing or invalid', row.roles);
                throw new ForbiddenException('User not authorized');
            }
            if (!row.roles.includes(SystemRole.PAYROLL_SPECIALIST)) {
                console.log('[payroll-exec] raw DB: roles do not include Payroll Specialist', row.roles);
                throw new ForbiddenException('User not authorized');
            }
            return true;
        } catch (e) {
            console.log('[payroll-exec] ensurePayrollSpecialist error:', e && e.message ? e.message : e);
            throw new ForbiddenException('User not authorized');
        }
    }

    async listSigningBonuses(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        return this.employeeSigningBonusModel.find(filter).lean().exec();
    }

    async getSigningBonus(id: string) {
        const doc = await this.employeeSigningBonusModel.findById(id).lean().exec();
        if (doc) return doc;
        const possibleExecNames = ['employeesigningbonuses', 'employee_signing_bonuses', 'employee_signingbonuses', 'employee_signing_bonus', 'employeeSigningBonuses', 'employeeSigningBonus'];
        const objectId = (() => { try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; } })();
        if (!objectId) return null;
        const db = this.db;
        if (!db) return null;
        for (const name of possibleExecNames) {
            try {
                const coll = db.collection(name as any);
                let found: any = null;
                try { found = await coll.findOne({ _id: objectId } as any); } catch (e) { found = null; }
                if (found) return found;
                found = await coll.findOne({ _id: id } as any);
                if (found) return found;
            } catch (err) { }
        }
        return null;
    }

    async updateSigningBonus(id: string, dto: { status?: BonusStatus; paymentDate?: string; amount?: number; note?: string }, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        const update: any = {};
        if (dto.status !== undefined) update.status = dto.status;
        if (dto.amount !== undefined) update.amount = dto.amount;
        if (dto.note !== undefined) update.note = dto.note;
        if (dto.paymentDate !== undefined) {
            const d = new Date(dto.paymentDate);
            if (isNaN(d.getTime())) throw new BadRequestException('Invalid paymentDate; expected ISO date string');
            update.paymentDate = d;
        }
        const doc = await this.employeeSigningBonusModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
        return doc;
    }

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

    // Termination/Resignation benefits - minimal CRUD used by controller
    async listTerminationBenefits(status?: string) {
        if (this.employeeTerminationResignationModel) {
            const filter: any = {};
            if (status) filter.status = status;
            return this.employeeTerminationResignationModel.find(filter).lean().exec();
        }
        const db = this.db;
        if (!db) return [];
        const filter: any = {};
        if (status) filter.status = status;
        try { return await db.collection(this.terminationCollectionName as any).find(filter).toArray(); } catch (e) { return []; }
    }

    async getTerminationBenefit(id: string) {
        try {
            if (this.employeeTerminationResignationModel) {
                const doc = await this.employeeTerminationResignationModel.findById(id).lean().exec();
                if (doc) return doc;
            }
        } catch (e) {}
        const db = this.db;
        if (!db) return null;
        try {
            const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
            if (oid) return await db.collection(this.terminationCollectionName as any).findOne({ _id: oid } as any);
            return await db.collection(this.terminationCollectionName as any).findOne({ _id: id } as any);
        } catch (err) { return null; }
    }

    async updateTerminationBenefit(id: string, dto: any, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        if (this.employeeTerminationResignationModel) {
            const update: any = {};
            if (dto.status !== undefined) update.status = dto.status;
            if (dto.note !== undefined) update.note = dto.note;
            if (dto.givenAmount !== undefined) update.givenAmount = dto.givenAmount;
            const doc = await this.employeeTerminationResignationModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
            if (doc) return doc;
        }
        const db = this.db;
        if (!db) return null;
        try {
            const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
            const filter = oid ? { _id: oid } : { _id: id };
            const updateDoc: any = {};
            if (dto.status !== undefined) updateDoc.status = dto.status;
            if (dto.note !== undefined) updateDoc.note = dto.note;
            if (dto.givenAmount !== undefined) updateDoc.givenAmount = dto.givenAmount;
            await db.collection(this.terminationCollectionName as any).updateOne(filter as any, { $set: updateDoc } as any);
            return await db.collection(this.terminationCollectionName as any).findOne(filter as any);
        } catch (err) { return null; }
    }

    async approveTerminationBenefit(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        const now = new Date();
        if (this.employeeTerminationResignationModel) {
            const doc = await this.employeeTerminationResignationModel.findByIdAndUpdate(id, { $set: { status: 'approved', approvedAt: now } }, { new: true }).exec();
            if (doc) return doc;
        }
        const db = this.db;
        if (!db) return null;
        try {
            const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
            const filter = oid ? { _id: oid } : { _id: id };
            await db.collection(this.terminationCollectionName as any).updateOne(filter as any, { $set: { status: 'approved', approvedAt: now } } as any);
            return await db.collection(this.terminationCollectionName as any).findOne(filter as any);
        } catch (err) { return null; }
    }

    async initiatePayroll(dto: any, initiatedBy?: string) {
        const runId = dto.runId || `PR-${Date.now()}`;
        let payrollPeriod: Date;
        if (dto.payrollPeriod) {
            payrollPeriod = new Date(dto.payrollPeriod);
            if (isNaN(payrollPeriod.getTime())) throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
        } else {
            payrollPeriod = new Date();
        }
        const payrollSpecialistId = dto.payrollSpecialistId
            ? (typeof dto.payrollSpecialistId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(dto.payrollSpecialistId); } catch (e) { return dto.payrollSpecialistId; } })() : dto.payrollSpecialistId)
            : (initiatedBy ? (() => { try { return new mongoose.Types.ObjectId(initiatedBy); } catch (e) { return initiatedBy; } })() : null);
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
        return { message: 'Payroll drafts feature removed; no draft available.' };
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

    async createPayrollInitiation(dto: any, createdBy?: string) {
        console.log('[payroll-exec] createPayrollInitiation called createdBy=', createdBy, 'dto=', dto);
        await this.ensurePayrollSpecialist(createdBy);
            // validate creator is allowed
            // Ensure required attributes and normalize types before persisting
            const runId = dto.runId || `PR-${Date.now()}`;
            let payrollPeriod: Date;
            if (dto.payrollPeriod) {
                payrollPeriod = new Date(dto.payrollPeriod);
                if (isNaN(payrollPeriod.getTime())) throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
            } else {
                payrollPeriod = new Date();
            }
            const payrollSpecialistId = createdBy ? (() => { try { return new mongoose.Types.ObjectId(createdBy); } catch (e) { return createdBy; } })() : null;
            const payrollManagerId = dto.payrollManagerId ? (typeof dto.payrollManagerId === 'string' ? (() => { try { return new mongoose.Types.ObjectId(dto.payrollManagerId); } catch (e) { return dto.payrollManagerId; } })() : dto.payrollManagerId) : payrollSpecialistId;
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
        if (existing.status === 'rejected') {
            update.status = 'draft';
            update.rejectionReason = null;
        }
        const updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
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
            return updated;
        }
    }

    async approvePayrollInitiation(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        const now = new Date();
        let updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: { status: 'under review', managerApprovalDate: now } }, { new: true }).exec();
        // If Mongoose lookup failed (possible when _id stored as string), fallback to raw DB lookup
        if (!updated) {
            try {
                const db = this.db;
                if (db) {
                    const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
                    const filter = oid ? { _id: oid } : { _id: id };
                    const raw = await db.collection('payrollruns').findOne(filter as any);
                    if (raw) updated = raw as any;
                }
            } catch (e) { updated = null; }
        }

        try {
            await this.processPayrollRun(updated);
            // After successful processing, try to update status to pending finance approval (persist via model or raw DB)
            try {
                const after = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: { status: 'pending finance approval' } }, { new: true }).exec();
                if (after) return after;
            } catch (e) {
                try {
                    const db = this.db;
                    if (db) {
                        const oid = (()=>{try{return new mongoose.Types.ObjectId(id);}catch(e){return null;}})();
                        const filter = oid ? { _id: oid } : { _id: id };
                        await db.collection('payrollruns').updateOne(filter as any, { $set: { status: 'pending finance approval' } } as any);
                        const afterRaw = await db.collection('payrollruns').findOne(filter as any);
                        return afterRaw as any;
                    }
                } catch (_) { }
            }
            return updated;
        } catch (err) {
            console.error('Payroll processing failed for run', id, err);
            return updated;
        }
    }

    async rejectPayrollInitiation(id: string, rejectedBy?: string, reason?: string) {
        await this.ensurePayrollSpecialist(rejectedBy);
        const updated = await this.payrollRunsModel.findByIdAndUpdate(id, { $set: { status: 'rejected', rejectionReason: reason || null } }, { new: true }).exec();
        return updated;
    }

    private async processPayrollRun(runDoc: payrollRunsDocument | any) {
        if (!runDoc || !runDoc._id) throw new BadRequestException('Invalid payroll run');
        const db = this.db;
        if (!db) throw new BadRequestException('Database unavailable');

        const payrollPeriod = runDoc.payrollPeriod ? new Date(runDoc.payrollPeriod) : new Date();
        const periodStart = new Date(payrollPeriod);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodStart.getMonth() + 1);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);

        let employeesIterable: any = null;
        if (this.employeeService && typeof (this.employeeService as any).findActive === 'function') {
            const list = await (this.employeeService as any).findActive(payrollPeriod);
            employeesIterable = Array.isArray(list) ? list : [];
        } else {
            const employeesColl = db.collection('employee_profiles');
            employeesIterable = employeesColl.find({ status: 'ACTIVE' });
        }

        let employeesCount = 0;
        let exceptionsCount = 0;
        let totalNet = 0;

        const taxRule = await db.collection('taxrules').findOne({ status: 'approved' }) || await db.collection('taxrules').findOne({}) || { rate: 0 };
        const insuranceBrackets = await db.collection('insurancebrackets').find({ status: 'approved' }).toArray().catch(()=>[]);

        const processEmployee = async (emp: any) => {
            if (!emp) return;
            employeesCount++;
            const employeeId = emp._id;

            // Auto-create payroll-execution signing bonus for new hires when offer contains a signingBonus
            try {
                if (emp && emp.dateOfHire) {
                    const doh = new Date(emp.dateOfHire);
                    if (doh >= periodStart && doh <= periodEnd) {
                        // try to find candidate by personal email and then an offer with signingBonus
                        try {
                            const candidate = await db.collection('candidates').findOne({ personalEmail: emp.personalEmail });
                            if (candidate) {
                                const offer = await db.collection('offers').findOne({ candidateId: candidate._id, signingBonus: { $exists: true, $gt: 0 } });
                                if (offer && offer.signingBonus && offer.signingBonus > 0) {
                                    // create or find a signingBonus config in payroll-configuration
                                    const sbFilter: any = { positionName: offer.role || (emp.primaryPositionId ? String(emp.primaryPositionId) : 'unknown'), amount: offer.signingBonus };
                                    let sbDoc = await db.collection('signingbonuses').findOne(sbFilter);
                                    if (!sbDoc) {
                                        const insertRes = await db.collection('signingbonuses').insertOne({ positionName: sbFilter.positionName, amount: offer.signingBonus, status: 'approved', createdBy: runDoc.payrollSpecialistId || null, approvedBy: runDoc.payrollManagerId || null, approvedAt: new Date() });
                                        sbDoc = await db.collection('signingbonuses').findOne({ _id: insertRes.insertedId });
                                    }
                                    if (sbDoc) {
                                        // ensure an employeeSigningBonus exists for this employee
                                        const exists = await db.collection('employeesigningbonuses').findOne({ employeeId: employeeId, signingBonusId: sbDoc._id });
                                        if (!exists) {
                                            await db.collection('employeesigningbonuses').insertOne({ employeeId: employeeId, signingBonusId: sbDoc._id, givenAmount: offer.signingBonus, status: 'pending', createdAt: new Date(), updatedAt: new Date() });
                                        }
                                    }
                                }
                            }
                        } catch (e) { /* ignore offer lookup errors */ }
                    }
                }
            } catch (e) { }

            let lastPayroll: any = null;
            try { lastPayroll = await db.collection('employeepayrolldetails').findOne({ employeeId: employeeId }, { sort: { createdAt: -1 } } as any); } catch (e) { lastPayroll = null; }

            let baseSalary = lastPayroll && (lastPayroll as any).baseSalary ? (lastPayroll as any).baseSalary : null;
            let allowances = lastPayroll && (lastPayroll as any).allowances ? (lastPayroll as any).allowances : 0;

            if (!baseSalary || baseSalary <= 0) {
                exceptionsCount++;
                const detail: any = {
                    employeeId: employeeId,
                    baseSalary: baseSalary || 0,
                    allowances: allowances || 0,
                    deductions: 0,
                    netSalary: 0,
                    netPay: 0,
                    bankStatus: 'missing',
                    exceptions: 'missing_base_salary',
                    payrollRunId: runDoc._id,
                };
                try { await this.employeePayrollDetailsModel.create(detail); } catch (e) { }
                return;
            }

            let insurance = insuranceBrackets.find((b: any) => baseSalary >= b.minSalary && baseSalary <= b.maxSalary) || null;
            const insurancePct = insurance ? (insurance.employeeRate ?? 0) : 0;

            let daysWorked = 30;
            try {
                if (this.timeService && typeof (this.timeService as any).findAttendanceSummary === 'function') {
                    const summary = await (this.timeService as any).findAttendanceSummary(employeeId.toString(), periodStart, periodEnd);
                    if (summary && typeof summary.daysWorked === 'number') daysWorked = summary.daysWorked;
                } else if (this.timeService && typeof (this.timeService as any).findByEmployee === 'function') {
                    const records = await (this.timeService as any).findByEmployee(employeeId.toString(), periodStart, periodEnd);
                    if (Array.isArray(records)) daysWorked = records.length > 0 ? 30 : 0;
                } else {
                    const attCount = await db.collection('attendance_records').countDocuments({ employeeId: employeeId, 'punches.time': { $gte: periodStart, $lte: periodEnd } as any }).catch(()=>0);
                    daysWorked = attCount > 0 ? 30 : 0;
                }
            } catch (e) { }

            let unpaidLeaveDays = 0;
            try {
                if (this.leavesService && typeof (this.leavesService as any).getUnpaidLeaveDays === 'function') {
                    unpaidLeaveDays = await (this.leavesService as any).getUnpaidLeaveDays(employeeId.toString(), periodStart, periodEnd);
                }
            } catch (e) { unpaidLeaveDays = 0; }

            daysWorked = Math.max(0, (daysWorked || 0) - (unpaidLeaveDays || 0));
            const unpaidDeduction = ((baseSalary || 0) / 30) * (unpaidLeaveDays || 0);

            const calcInput = {
                baseSalary: baseSalary,
                daysInPeriod: 30,
                daysWorked: daysWorked,
                taxRatePct: taxRule.rate ?? 0,
                pensionPct: 0,
                insurancePct: insurancePct,
                penalties: unpaidDeduction || 0,
                refunds: 0,
                bonus: 0,
                benefit: 0,
            };

            const result = this.payCalculator.calculate(calcInput as any);

            try {
                const sb = await db.collection('employeesigningbonuses').findOne({ employeeId: employeeId, status: 'pending' });
                if (sb) {
                    await db.collection('employeesigningbonuses').updateOne({ _id: sb._id }, { $set: { status: 'approved', paymentDate: new Date() } });
                    result.netPay += (sb.givenAmount || 0);
                }
            } catch (e) { }

            try {
                const tb = await db.collection(this.terminationCollectionName as any).findOne({ employeeId: employeeId, status: 'pending' });
                if (tb) {
                    await db.collection(this.terminationCollectionName as any).updateOne({ _id: tb._id }, { $set: { status: 'approved', approvedAt: new Date() } });
                    result.netPay += (tb.givenAmount || 0);
                }
            } catch (e) { }

            const payslip: any = {
                employeeId: employeeId,
                payrollRunId: runDoc._id,
                earningsDetails: {
                    baseSalary: baseSalary,
                    allowances: [],
                    bonuses: [],
                    benefits: [],
                    refunds: [],
                },
                deductionsDetails: {
                    taxes: [{ name: taxRule.name || 'tax', rate: taxRule.rate ?? 0 }],
                    insurances: insurance ? [insurance] : [],
                    penalties: null,
                },
                totalGrossSalary: result.proratedGross,
                totaDeductions: result.deductions,
                netPay: result.netPay,
                paymentStatus: 'pending',
            };
            try { await this.paySlipModel.create(payslip); } catch (e) { }

            const details: any = {
                employeeId: employeeId,
                baseSalary: baseSalary,
                allowances: allowances || 0,
                deductions: result.deductions,
                netSalary: result.proratedGross - result.deductions,
                netPay: result.netPay,
                bankStatus: 'valid',
                exceptions: null,
                bonus: 0,
                benefit: 0,
                payrollRunId: runDoc._id,
            };
            try { await this.employeePayrollDetailsModel.create(details); } catch (e) { }

            totalNet += result.netPay;
        };

        if (Array.isArray(employeesIterable)) {
            for (const emp of employeesIterable) {
                await processEmployee(emp);
            }
        } else {
            while (await employeesIterable.hasNext()) {
                const emp = await employeesIterable.next();
                await processEmployee(emp);
            }
        }

        try {
            await this.payrollRunsModel.findByIdAndUpdate(runDoc._id, { $set: { employees: employeesCount, exceptions: exceptionsCount, totalnetpay: totalNet } }).exec();
        } catch (e) { }
        return true;
    }
}
