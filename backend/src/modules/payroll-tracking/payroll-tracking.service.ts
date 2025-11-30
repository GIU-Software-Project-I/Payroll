import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { refunds } from '../../schemas/payroll-tracking/refunds.schema';
import { claims } from '../../schemas/payroll-tracking/claims.schema';
import { disputes } from '../../schemas/payroll-tracking/disputes.schema';

import {
  ClaimStatus,
  DisputeStatus,
  RefundStatus
} from '../../enums/payroll-tracking/payroll-tracking-enum';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(refunds.name) private refundModel: Model<any>,
    @InjectModel(claims.name) private claimModel: Model<any>,
    @InjectModel(disputes.name) private disputeModel: Model<any>,
  ) {}

  // =====================================================
  // A. VIEW APPROVED ITEMS
  // =====================================================

  getApprovedDisputes() {
    return this.disputeModel.find({ status: DisputeStatus.APPROVED });
  }

  getApprovedClaims() {
    return this.claimModel.find({ status: ClaimStatus.APPROVED });
  }

  // =====================================================
  // B. REFUND GENERATION
  // =====================================================

  async generateRefundForDispute(disputeId: string) {
    const dispute = await this.disputeModel.findById(disputeId);

    if (!dispute) throw new NotFoundException('Dispute not found');

    // Disputes have no amount → business rule: refund is 0 unless handled externally
    const amount = dispute.approvedAmount ?? 0;

    return this.refundModel.create({
      disputeId,
      refundDetails: {
        description: dispute.description,
        amount: amount,
      },
      employeeId: dispute.employeeId,
      status: RefundStatus.PENDING,
    });
  }

  async generateRefundForClaim(claimId: string) {
    const claim = await this.claimModel.findById(claimId);

    if (!claim) throw new NotFoundException('Claim not found');

    // Amount refunded = approvedAmount if exists, else full amount
    const refundAmount = claim.approvedAmount ?? claim.amount;

    return this.refundModel.create({
      claimId,
      refundDetails: {
        description: claim.description,
        amount: refundAmount,
      },
      employeeId: claim.employeeId,
      status: RefundStatus.PENDING,
    });
  }

  getPendingRefunds() {
    return this.refundModel.find({ status: RefundStatus.PENDING });
  }

  async getRefundDetails(refundId: string) {
    const refund = await this.refundModel.findById(refundId);

    if (!refund) throw new NotFoundException('Refund not found');

    return refund;
  }

  // =====================================================
  // C. EXECUTE REFUND (MARK AS PAID IN PAYROLL)
  // =====================================================

  async executeRefund(refundId: string) {
    const refund = await this.refundModel.findById(refundId);

    if (!refund) throw new NotFoundException('Refund not found');

    refund.status = RefundStatus.PAID;
    return refund.save();
  }

  // =====================================================
  // D. FINANCE REPORTS
  // =====================================================

  async getMonthEndReport() {
    return {
      totalRefunds: await this.refundModel.countDocuments(),
      pending: await this.refundModel.countDocuments({ status: RefundStatus.PENDING }),
      paid: await this.refundModel.countDocuments({ status: RefundStatus.PAID }),
      approvedClaims: await this.claimModel.countDocuments({ status: ClaimStatus.APPROVED }),
      approvedDisputes: await this.disputeModel.countDocuments({ status: DisputeStatus.APPROVED }),
    };
  }

  async getYearEndReport() {
    return {
      refunds: await this.refundModel.find(),
      claimsSummary: await this.claimModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      disputeSummary: await this.disputeModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
    };
  }

  async getTaxReport() {
    // claims do not have tax fields → you will integrate later with payroll execution
    return {
      message: 'Tax audit report depends on payroll tax records — integrate after payroll execution is completed'
    };
  }
}
