import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payslip, PayslipDocument } from '../../schemas/payroll-tracking/payslip.schema';
import { Claim, ClaimDocument } from '../../schemas/payroll-tracking/claim.schema';
import { Dispute, DisputeDocument } from '../../schemas/payroll-tracking/dispute.schema';
import { Employee, EmployeeDocument } from '../../schemas/payroll-tracking/employee.schema';
import { AuditLog, AuditLogDocument } from '../../schemas/payroll-tracking/audit-log.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { MockIntegrationService } from '../integrations/mock-integration.service';
import { computeUnpaidLeaveDeduction } from './utils/salary.utils';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(Payslip.name) private payslipModel: Model<PayslipDocument>,
    @InjectModel(Claim.name) private claimModel: Model<ClaimDocument>,
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private integrations: MockIntegrationService,
  ) {}

  // Payslips
  async getPayslipsByEmployee(employeeId: string) {
    const id = Types.ObjectId.isValid(employeeId) ? new Types.ObjectId(employeeId) : null;
    if (!id) return [];
    const payslips = await this.payslipModel
      .find({ employeeId: id })
      .sort({ payrollCycle: -1 })
      .lean()
      .exec();

    // enrich with mock integration data (employee profile, encashment, unpaid leave, absenteeism)
    const employeeProfile = await this.integrations.getEmployeeContract(employeeId);

    const enriched = await Promise.all(
      payslips.map(async (p) => {
        const encashment = await this.integrations.getEncashment(employeeId, p.payrollCycle);
        const unpaid = await this.integrations.getUnpaidLeaveStatus(employeeId, p.payrollCycle);
        const absenteeism = await this.integrations.getAbsenteeism(
          employeeId,
          p.payrollCycle,
          p.payrollCycle,
        );

        // compute unpaid leave deduction using profile if possible
        let computedUnpaidDeduction = 0;
        if (employeeProfile && employeeProfile.baseSalary && unpaid && unpaid.unpaidDays) {
          computedUnpaidDeduction = computeUnpaidLeaveDeduction(employeeProfile.baseSalary, unpaid.unpaidDays);
        }

        // derive itemized lists from payslip items when present
        const items = (p.items || []) as Array<{ label?: string; type?: string; amount?: number }>;
        const taxItems = items.filter(
          (it) => it.type === 'tax' || /tax/i.test(String(it.label || '')),
        );
        const insuranceItems = items.filter(
          (it) =>
            it.type === 'insurance' ||
            /insurance|pension|health|unemployment/i.test(String(it.label || '')),
        );
        const employerContributions = items.filter(
          (it) =>
            it.type === 'employerContribution' ||
            /employer|contribution|allowance/i.test(String(it.label || '')),
        );
        const transport = items.find(
          (it) => it.type === 'transport' || /transport|commut/i.test(String(it.label || '')),
        );

        return {
          ...p,
          employeeProfile,
          encashment,
          unpaid,
          absenteeism,
          computedUnpaidDeduction,
          computedEncashment: encashment?.encashmentAmount || 0,
          transportCompensation: transport?.amount || 0,
          taxItems,
          insuranceItems,
          employerContributions,
        };
      }),
    );

    return enriched;
  }

  async getPayslipById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Payslip not found');
    const p = await this.payslipModel.findById(id).exec();
    if (!p) throw new NotFoundException('Payslip not found');
    // enrich with integration data
    const employeeId = p.employeeId?.toString();
    const employeeProfile = employeeId ? await this.integrations.getEmployeeContract(employeeId) : null;
    const encashment = employeeId ? await this.integrations.getEncashment(employeeId, p.payrollCycle) : null;
    const unpaid = employeeId ? await this.integrations.getUnpaidLeaveStatus(employeeId, p.payrollCycle) : null;
    const absenteeism = employeeId ? await this.integrations.getAbsenteeism(employeeId, p.payrollCycle, p.payrollCycle) : null;

    // compute unpaid deduction
    let computedUnpaidDeduction = 0;
    if (employeeProfile && employeeProfile.baseSalary && unpaid && unpaid.unpaidDays) {
      computedUnpaidDeduction = computeUnpaidLeaveDeduction(employeeProfile.baseSalary, unpaid.unpaidDays);
    }

  const items = (p.items || []) as Array<{ label?: string; type?: string; amount?: number }>;
  const taxItems = items.filter((it) => it.type === 'tax' || /tax/i.test(String(it.label || '')));
  const insuranceItems = items.filter((it) => it.type === 'insurance' || /insurance|pension|health|unemployment/i.test(String(it.label || '')));
  const employerContributions = items.filter((it) => it.type === 'employerContribution' || /employer|contribution|allowance/i.test(String(it.label || '')));
  const transport = items.find((it) => it.type === 'transport' || /transport|commut/i.test(String(it.label || '')));

    return {
      ...p.toObject(),
      employeeProfile,
      encashment,
      unpaid,
      absenteeism,
      computedUnpaidDeduction,
      computedEncashment: encashment?.encashmentAmount || 0,
      transportCompensation: transport?.amount || 0,
      taxItems,
      insuranceItems,
      employerContributions,
    };
  }

  /**
   * Returns a download URL or null if not available. Frontend can call and stream.
   */
  async getPayslipDownloadUrl(id: string) {
    const p = await this.getPayslipById(id);
    return p.pdfUrl || null;
  }

  // Claims
  async createClaim(dto: CreateClaimDto) {
    // basic employee existence check
    const empId = (dto as any).employeeId;
    if (!Types.ObjectId.isValid(empId)) throw new NotFoundException('Employee not found');
    const claim = new this.claimModel(dto as any);
    return claim.save();
  }

  async getClaimsByEmployee(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) return [];
    return this.claimModel.find({ employeeId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getClaimById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Claim not found');
    const c = await this.claimModel.findById(id).exec();
    if (!c) throw new NotFoundException('Claim not found');
    return c;
  }

  // Claims approval workflow
  async getClaimsPendingForSpecialist() {
    return this.claimModel.find({ status: 'submitted' }).sort({ createdAt: 1 }).lean().exec();
  }

  async getClaimsPendingForManager() {
    return this.claimModel.find({ status: 'in_review' }).sort({ createdAt: 1 }).lean().exec();
  }

  async specialistApproveClaim(claimId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(claimId)) throw new NotFoundException('Claim not found');
    const claim = await this.claimModel.findById(claimId).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    claim.status = 'in_review';
    claim.actions = claim.actions || [];
    claim.actions.push({ actorId: new Types.ObjectId(actorId), actionType: 'specialist_approved', comment, timestamp: new Date() } as any);
    await claim.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'approve_claim', objectType: 'Claim', objectId: claim._id, details: { comment } });
    return claim;
  }

  async specialistRejectClaim(claimId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(claimId)) throw new NotFoundException('Claim not found');
    const claim = await this.claimModel.findById(claimId).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    claim.status = 'rejected';
    claim.actions = claim.actions || [];
    claim.actions.push({ actorId: new Types.ObjectId(actorId), actionType: 'specialist_rejected', comment, timestamp: new Date() } as any);
    await claim.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'reject_claim', objectType: 'Claim', objectId: claim._id, details: { comment } });
    return claim;
  }

  async managerConfirmClaim(claimId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(claimId)) throw new NotFoundException('Claim not found');
    const claim = await this.claimModel.findById(claimId).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    claim.status = 'approved';
    claim.actions = claim.actions || [];
    claim.actions.push({ actorId: new Types.ObjectId(actorId), actionType: 'manager_confirmed', comment, timestamp: new Date() } as any);
    await claim.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'confirm_claim', objectType: 'Claim', objectId: claim._id, details: { comment } });
    return claim;
  }

  async managerDenyClaim(claimId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(claimId)) throw new NotFoundException('Claim not found');
    const claim = await this.claimModel.findById(claimId).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    claim.status = 'denied';
    claim.actions = claim.actions || [];
    claim.actions.push({ actorId: new Types.ObjectId(actorId), actionType: 'manager_denied', comment, timestamp: new Date() } as any);
    await claim.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'deny_claim', objectType: 'Claim', objectId: claim._id, details: { comment } });
    return claim;
  }

  // Disputes
  async createDispute(dto: CreateDisputeDto) {
    // verify payslip exists
    const payslipId = (dto as any).payslipId;
    if (!Types.ObjectId.isValid(payslipId)) throw new NotFoundException('Payslip not found');
    const dispute = new this.disputeModel(dto as any);
    return dispute.save();
  }

  async getDisputesByEmployee(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) return [];
    return this.disputeModel.find({ employeeId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getDisputeById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Dispute not found');
    const d = await this.disputeModel.findById(id).exec();
    if (!d) throw new NotFoundException('Dispute not found');
    return d;
  }

  // Dispute approval workflow
  async getDisputesPendingForSpecialist() {
    return this.disputeModel.find({ status: 'pending' }).sort({ createdAt: 1 }).lean().exec();
  }

  async getDisputesPendingForManager() {
    return this.disputeModel.find({ status: 'in_review' }).sort({ createdAt: 1 }).lean().exec();
  }

  async specialistApproveDispute(disputeId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(disputeId)) throw new NotFoundException('Dispute not found');
    const dispute = await this.disputeModel.findById(disputeId).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = 'in_review';
    // write a minimal resolution comment for trace
    dispute.resolution = dispute.resolution || {};
    dispute.resolution.comment = comment;
    await dispute.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'approve_dispute', objectType: 'Dispute', objectId: dispute._id, details: { comment } });
    return dispute;
  }

  async specialistRejectDispute(disputeId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(disputeId)) throw new NotFoundException('Dispute not found');
    const dispute = await this.disputeModel.findById(disputeId).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = 'rejected';
    dispute.resolution = dispute.resolution || {};
    dispute.resolution.comment = comment;
    await dispute.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'reject_dispute', objectType: 'Dispute', objectId: dispute._id, details: { comment } });
    return dispute;
  }

  async managerConfirmDispute(disputeId: string, actorId: string, amountAdjusted?: number, comment?: string) {
    if (!Types.ObjectId.isValid(disputeId)) throw new NotFoundException('Dispute not found');
    const dispute = await this.disputeModel.findById(disputeId).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = 'approved';
    dispute.resolution = dispute.resolution || {};
    dispute.resolution.approvedBy = new Types.ObjectId(actorId);
    dispute.resolution.approvedAt = new Date();
    dispute.resolution.amountAdjusted = amountAdjusted;
    dispute.resolution.comment = comment;
    await dispute.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'confirm_dispute', objectType: 'Dispute', objectId: dispute._id, details: { amountAdjusted, comment } });
    return dispute;
  }

  async managerDenyDispute(disputeId: string, actorId: string, comment?: string) {
    if (!Types.ObjectId.isValid(disputeId)) throw new NotFoundException('Dispute not found');
    const dispute = await this.disputeModel.findById(disputeId).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = 'denied';
    dispute.resolution = dispute.resolution || {};
    dispute.resolution.comment = comment;
    await dispute.save();
    await this.auditLogModel.create({ actorId: new Types.ObjectId(actorId), action: 'deny_dispute', objectType: 'Dispute', objectId: dispute._id, details: { comment } });
    return dispute;
  }

  // Reports (simple aggregations)
  async reportPayrollByDepartment() {
    // aggregate payslips by department via employee ref
    return this.payslipModel.aggregate([
      { $lookup: { from: 'employees', localField: 'employeeId', foreignField: '_id', as: 'employee' } },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$employee.departmentId', totalGross: { $sum: '$grossPay' }, totalNet: { $sum: '$netPay' }, count: { $sum: 1 } } },
    ]).exec();
  }

  async reportMonthEnd(month: number, year: number) {
    // month: 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.payslipModel.aggregate([
      { $match: { payrollCycle: { $gte: start, $lt: end } } },
      { $group: { _id: null, totalGross: { $sum: '$grossPay' }, totalNet: { $sum: '$netPay' }, count: { $sum: 1 } } },
    ]).exec();
  }

  async reportYearEnd(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return this.payslipModel.aggregate([
      { $match: { payrollCycle: { $gte: start, $lt: end } } },
      { $group: { _id: null, totalGross: { $sum: '$grossPay' }, totalNet: { $sum: '$netPay' }, count: { $sum: 1 } } },
    ]).exec();
  }

  async reportTaxInsuranceBenefits() {
    // simplistic report: sum of tax items and insurance items across payslips
    return this.payslipModel.aggregate([
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$items.type', totalAmount: { $sum: '$items.amount' } } },
    ]).exec();
  }

  // Notification trigger (simple): create audit and return count of approved items
  async notifyFinance() {
    const approvedDisputes = await this.disputeModel.find({ status: 'approved' }).lean().exec();
    const approvedClaims = await this.claimModel.find({ status: 'approved' }).lean().exec();
    const total = (approvedDisputes?.length || 0) + (approvedClaims?.length || 0);
    await this.auditLogModel.create({ action: 'notify_finance', objectType: 'Notification', objectId: new Types.ObjectId(), details: { approvedDisputes: approvedDisputes.length, approvedClaims: approvedClaims.length } as any });
    return { total, approvedDisputes: approvedDisputes.length, approvedClaims: approvedClaims.length };
  }

  // Utility
  async getEmployeeById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Employee not found');
    return this.employeeModel.findById(id).lean().exec();
  }

  // Tax documents (mock)
  async getTaxDocumentUrl(employeeId: string, year: number) {
    // In real flow, generate or fetch from storage. Return mock URL for Phase 1.
    return `https://storage.example.com/tax-docs/${employeeId}/tax-${year}.pdf`;
  }

  // Employee base salary from integration/profile
  async getEmployeeBaseSalary(employeeId: string) {
    const profile = await this.integrations.getEmployeeContract(employeeId);
    return { baseSalary: profile.baseSalary, employmentType: profile.employmentType };
  }
}