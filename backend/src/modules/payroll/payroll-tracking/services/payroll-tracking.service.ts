import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { paySlip } from '../../payroll-execution/models/payslip.schema';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { claims, claimsDocument } from '../models/claims.schema';
import { refunds } from '../models/refunds.schema';
import {
  CreateClaimDto,
  CreateDisputeDto,
  DecideClaimDto,
  DecideDisputeDto,
  PayslipQueryDto,
  TaxDocumentQueryDto,
  UpdateRefundStatusDto,
} from '../dto/payroll-tracking.dto';
import { ClaimStatus, DisputeStatus, RefundStatus } from '../enums/payroll-tracking-enum';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(paySlip.name) private readonly payslipModel: Model<paySlip>,
    @InjectModel(disputes.name) private readonly disputeModel: Model<disputes>,
    @InjectModel(claims.name) private readonly claimModel: Model<claims>,
    @InjectModel(refunds.name) private readonly refundModel: Model<refunds>,
  ) {}

  // ===== Employee-facing: Payslips & history =====

  async getEmployeePayslips(employeeId: string, query: PayslipQueryDto) {
    const filters: any = { employeeId: new Types.ObjectId(employeeId) };

    if (query.fromDate || query.toDate) {
      filters.createdAt = {};
      if (query.fromDate) filters.createdAt.$gte = query.fromDate;
      if (query.toDate) filters.createdAt.$lte = query.toDate;
    }

    return this.payslipModel
      .find(filters)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEmployeePayslipById(employeeId: string, payslipId: string) {
    const payslip = await this.payslipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found for this employee');
    }

    return payslip;
  }

  async getEmployeeSalaryHistory(employeeId: string) {
    return this.payslipModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .select(['totalGrossSalary', 'totaDeductions', 'netPay', 'createdAt', 'payrollRunId'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEmployeeTaxDocuments(employeeId: string, query: TaxDocumentQueryDto) {
    const year = query.year ?? new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const payslips = await this.payslipModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: { $gte: start, $lt: end },
      })
      .exec();

    const totalTax = payslips.reduce((sum, p: any) => {
      const taxes = p.deductionsDetails?.taxes || [];
      const monthlyTax = taxes.reduce((tSum: number, t: any) => tSum + (t.amount || 0), 0);
      return sum + monthlyTax;
    }, 0);

    return {
      employeeId,
      year,
      totalTax,
      months: payslips.map((p: any) => ({
        payslipId: p._id,
        payrollRunId: p.payrollRunId,
        periodDate: p.createdAt,
        totalGrossSalary: p.totalGrossSalary,
        netPay: p.netPay,
        taxes: p.deductionsDetails?.taxes || [],
      })),
    };
  }

  // ===== Employee-facing: Disputes =====

  private async generateDisputeId(): Promise<string> {
    const count = await this.disputeModel.countDocuments().exec();
    return `DISP-${String(count + 1).padStart(4, '0')}`;
  }

  async createDispute(employeeId: string, dto: CreateDisputeDto) {
    // Ensure payslip belongs to employee
    await this.getEmployeePayslipById(employeeId, dto.payslipId);

    const disputeId = await this.generateDisputeId();

    const created = await this.disputeModel.create({
      disputeId,
      description: dto.description,
      employeeId: new Types.ObjectId(employeeId),
      payslipId: new Types.ObjectId(dto.payslipId),
      status: DisputeStatus.UNDER_REVIEW,
    });

    return created;
  }

  async getEmployeeDisputes(employeeId: string) {
    return this.disputeModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEmployeeDisputeById(employeeId: string, disputeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new NotFoundException('Invalid employeeId format');
    }

    // Try to find by MongoDB _id first, if it's a valid ObjectId
    let dispute: disputesDocument | null = null;
    if (Types.ObjectId.isValid(disputeId)) {
      dispute = await this.disputeModel
        .findOne({
          _id: new Types.ObjectId(disputeId),
          employeeId: new Types.ObjectId(employeeId),
        })
        .exec();
    }
    
    // If not found by _id, try to find by disputeId string (e.g., "DISP-0001")
    if (!dispute) {
      dispute = await this.disputeModel
        .findOne({
          disputeId: disputeId,
          employeeId: new Types.ObjectId(employeeId),
        })
        .exec();
    }

    if (!dispute) {
      throw new NotFoundException('Dispute not found for this employee');
    }

    return dispute;
  }

  // ===== Employee-facing: Claims =====

  private async generateClaimId(): Promise<string> {
    const count = await this.claimModel.countDocuments().exec();
    return `CLAIM-${String(count + 1).padStart(4, '0')}`;
  }

  async createClaim(employeeId: string, dto: CreateClaimDto) {
    const claimId = await this.generateClaimId();

    const created = await this.claimModel.create({
      claimId,
      description: dto.description,
      claimType: dto.claimType,
      employeeId: new Types.ObjectId(employeeId),
      amount: dto.amount,
      status: ClaimStatus.UNDER_REVIEW,
    });

    return created;
  }

  async getEmployeeClaims(employeeId: string) {
    return this.claimModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEmployeeClaimById(employeeId: string, claimId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new NotFoundException('Invalid employeeId format');
    }

    // Try to find by MongoDB _id first, if it's a valid ObjectId
    let claim: claimsDocument | null = null;
    if (Types.ObjectId.isValid(claimId)) {
      claim = await this.claimModel
        .findOne({
          _id: new Types.ObjectId(claimId),
          employeeId: new Types.ObjectId(employeeId),
        })
        .exec();
    }
    
    // If not found by _id, try to find by claimId string (e.g., "CLAIM-0001")
    if (!claim) {
      claim = await this.claimModel
        .findOne({
          claimId: claimId,
          employeeId: new Types.ObjectId(employeeId),
        })
        .exec();
    }

    if (!claim) {
      throw new NotFoundException('Claim not found for this employee');
    }

    return claim;
  }

  async getEmployeeRefunds(employeeId: string) {
    return this.refundModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ===== Staff-facing: approvals & refunds =====

  async listDisputesByStatus(status?: DisputeStatus) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.disputeModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async decideDispute(disputeId: string, financeStaffId: string, dto: DecideDisputeDto) {
    const dispute = await this.disputeModel.findById(disputeId).exec();
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.status = dto.status;
    dispute.financeStaffId = new Types.ObjectId(financeStaffId);
    dispute.rejectionReason = dto.rejectionReason;
    dispute.resolutionComment = dto.resolutionComment;
    await dispute.save();

    let createdRefund: refunds | null = null;

    if (dto.status === DisputeStatus.APPROVED && dto.refundAmount && dto.refundAmount > 0) {
      createdRefund = await this.refundModel.create({
        disputeId: dispute._id,
        refundDetails: {
          description: dto.refundDescription || dispute.description,
          amount: dto.refundAmount,
        },
        employeeId: dispute.employeeId,
        financeStaffId: new Types.ObjectId(financeStaffId),
        status: RefundStatus.PENDING,
      });
    }

    return { dispute, refund: createdRefund };
  }

  async listClaimsByStatus(status?: ClaimStatus) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.claimModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async decideClaim(claimId: string, financeStaffId: string, dto: DecideClaimDto) {
    const claim = await this.claimModel.findById(claimId).exec();
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    claim.status = dto.status;
    claim.financeStaffId = new Types.ObjectId(financeStaffId);
    claim.approvedAmount = dto.approvedAmount;
    claim.rejectionReason = dto.rejectionReason;
    claim.resolutionComment = dto.resolutionComment;
    await claim.save();

    let createdRefund: refunds | null = null;

    if (dto.status === ClaimStatus.APPROVED && dto.approvedAmount && dto.approvedAmount > 0) {
      createdRefund = await this.refundModel.create({
        claimId: claim._id,
        refundDetails: {
          description: dto.refundDescription || claim.description,
          amount: dto.approvedAmount,
        },
        employeeId: claim.employeeId,
        financeStaffId: new Types.ObjectId(financeStaffId),
        status: RefundStatus.PENDING,
      });
    }

    return { claim, refund: createdRefund };
  }

  async updateRefundStatus(refundId: string, dto: UpdateRefundStatusDto) {
    const refund = await this.refundModel.findById(refundId).exec();
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = dto.status;
    if (dto.paidInPayrollRunId) {
      refund.paidInPayrollRunId = new Types.ObjectId(dto.paidInPayrollRunId);
    }

    await refund.save();
    return refund;
  }
}
