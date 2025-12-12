import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from '../models/claims.schema';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { refunds, refundsDocument } from '../models/refunds.schema';

import { ClaimStatus, DisputeStatus, RefundStatus } from '../enums/payroll-tracking-enum';
import { paySlip, PayslipDocument } from '../../payroll-execution/models/payslip.schema';
import { EmployeeProfile } from '../../../employee/models/employee/employee-profile.schema';
import { ContractType, WorkType } from '../../../employee/enums/employee-profile.enums';
import { CreateClaimDto, CreateDisputeDto, UpdateClaimDto, UpdateDisputeDto, UpdateRefundDto } from '../dtos';
import { PaginationDto } from '../dtos/pagination.dto';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(claims.name) private claimsModel: Model<claimsDocument>,
    @InjectModel(disputes.name) private disputesModel: Model<disputesDocument>,
    @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
    @InjectModel(paySlip.name) private payslipModel: Model<PayslipDocument>,
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
  ) {}

  // ========== employee Self-Service Methods ==========

  // REQ-PY-1: View and download payslip
  async getEmployeePayslips(employeeId: string) {
    const objectId = new Types.ObjectId(employeeId);
    return this.payslipModel.find({ employeeId: objectId }).exec();
  }

  // REQ-PY-1 (download part): Get full payslip data for download
  async downloadPayslip(payslipId: string, employeeId: string) {
    const objectId = new Types.ObjectId(payslipId);
    const employeeObjectId = new Types.ObjectId(employeeId);

    const payslip = await this.payslipModel.findOne({
      _id: objectId,
      employeeId: employeeObjectId,
    }).exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    // This structure is suitable for the frontend to generate a PDF/CSV download
    return {
      payslipId: payslip._id,
      employeeId: payslip.employeeId,
      payrollRunId: payslip.payrollRunId,
      earningsDetails: payslip.earningsDetails,
      deductionsDetails: payslip.deductionsDetails,
      totalGrossSalary: payslip.totalGrossSalary,
      totalDeductions: payslip.totaDeductions,
      netPay: payslip.netPay,
      paymentStatus: payslip.paymentStatus,
      createdAt: (payslip as any)?.createdAt,
      updatedAt: (payslip as any)?.updatedAt,
    };
  }

  // REQ-PY-2: View payslip status and details
  async getPayslipDetails(payslipId: string, employeeId: string) {
    const objectId = new Types.ObjectId(payslipId);
    const employeeObjectId = new Types.ObjectId(employeeId);
    
    const payslip = await this.payslipModel.findOne({
      _id: objectId,
      employeeId: employeeObjectId
    }).exec();
    
    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }
    
    // Get any disputes for this payslip
    const payslipDisputes = await this.disputesModel.find({
      payslipId: objectId
    }).exec();
    
    return {
      payslip,
      disputes: payslipDisputes
    };
  }

  // REQ-PY-3: View base salary
  async getBaseSalary(employeeId: string) {
    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee) {
      throw new NotFoundException('employee not found');
    }
    
    // Derive contract/work type with sensible defaults
    const contractType: ContractType = employee.contractType || ContractType.FULL_TIME_CONTRACT;
    const workType: WorkType = employee.workType || WorkType.FULL_TIME;

    // Try to use baseSalary from employee profile if present
    let contractualBaseSalary = (employee as any)?.baseSalary as number | undefined;

    // If not available on profile, fall back to latest payslip base salary
    if (contractualBaseSalary == null) {
      const latestPayslip = await this.payslipModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
      })
        .sort({ createdAt: -1 })
        .exec();

      if (latestPayslip?.earningsDetails?.baseSalary != null) {
        contractualBaseSalary = latestPayslip.earningsDetails.baseSalary;
      }
    }

    const baseMonthlySalary = contractualBaseSalary || 0;

    // Simple working-hours assumption for hourly-rate view
    const STANDARD_FULL_TIME_HOURS_PER_MONTH = 160; // 8h * 5d * 4w
    const STANDARD_PART_TIME_HOURS_PER_MONTH = 80;  // example: 4h * 5d * 4w

    const hoursPerMonth =
      workType === WorkType.PART_TIME
        ? STANDARD_PART_TIME_HOURS_PER_MONTH
        : STANDARD_FULL_TIME_HOURS_PER_MONTH;

    const hourlyRate = hoursPerMonth > 0 ? baseMonthlySalary / hoursPerMonth : 0;

    return {
      employeeId: employee._id,
      fullName: `${employee.firstName} ${employee.lastName}`,
      contractType,
      workType,
      jobTitle: (employee as any)?.jobTitle || 'N/A',
      baseMonthlySalary,
      hoursPerMonth,
      hourlyRate,
      currency: (employee as any)?.currency || 'USD',
    };
  }

  // REQ-PY-5: View leave compensation (integration placeholder)
  async getLeaveCompensation(employeeId: string) {
    // This method would integrate with Leaves module
    // For now, return placeholder data
    return {
      employeeId,
      unusedLeaveDays: 0, // Would come from Leaves module
      encashmentRate: 0, // Would come from Payroll Configuration
      totalCompensation: 0,
      lastUpdated: new Date().toISOString(),
      note: 'Integration with Leaves module required'
    };
  }

  // REQ-PY-7: View transportation compensation
  async getTransportationCompensation(employeeId: string) {
    // This would come from Payroll Execution data
    const payslips = await this.payslipModel.find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
    
    if (payslips.length === 0) {
      return { transportationAllowance: 0 };
    }
    
    const latestPayslip = payslips[0];
    // Get transportation allowance from earnings details
    let transportationAllowance = 0;
    if (latestPayslip.earningsDetails?.allowances) {
      transportationAllowance = latestPayslip.earningsDetails.allowances
        .filter(a => (a as any)?.type === 'transportation')
        .reduce((sum, a) => sum + ((a as any)?.amount || 0), 0);
    }
    return {
      transportationAllowance,
      createdAt: (latestPayslip as any)?.createdAt || new Date()
    };
  }

  // REQ-PY-8: View tax deductions
  async getTaxDeductions(employeeId: string, payslipId?: string) {
    let query: any = { employeeId: new Types.ObjectId(employeeId) };
    
    if (payslipId) {
      query._id = new Types.ObjectId(payslipId);
    }
    
    const payslips = await this.payslipModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    
    return payslips.map(payslip => {
      const taxes = (payslip.deductionsDetails?.taxes || []) as any[];

      const taxableBase =
        payslip.totalGrossSalary ||
        (payslip.earningsDetails as any)?.baseSalary ||
        0;

      const taxDetails = taxes.map((tax: any) => {
        const amount = tax.amount ?? 0;
        const configuredRatePct = tax.rate ?? null; // from taxRules
        const effectiveRatePct =
          taxableBase > 0 ? (amount / taxableBase) * 100 : null;

        return {
          ruleName: tax.name,
          description: tax.description,
          configuredRatePct,
          calculatedAmount: amount,
          taxableBase,
          effectiveRatePct,
        };
      });

      const totalTax = taxDetails.reduce(
        (sum, t) => sum + (t.calculatedAmount || 0),
        0,
      );

      return {
        payslipId: payslip._id,
        totalTax,
        taxDetails,
      };
    });
  }

  // REQ-PY-9: View insurance deductions
  async getInsuranceDeductions(employeeId: string, payslipId?: string) {
    let query: any = { employeeId: new Types.ObjectId(employeeId) };
    
    if (payslipId) {
      query._id = new Types.ObjectId(payslipId);
    }
    
    const payslips = await this.payslipModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    
    return payslips.map(payslip => ({
      payslipId: payslip._id,
      insuranceDeductions: payslip.deductionsDetails?.insurances || [],
      totalInsurance: payslip.deductionsDetails?.insurances?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
      // Additional insurance details
    }));
  }

  // REQ-PY-10: View misconduct/absenteeism deductions
  async getMisconductDeductions(employeeId: string, payslipId?: string) {
    let query: any = { employeeId: new Types.ObjectId(employeeId) };
    
    if (payslipId) {
      query._id = new Types.ObjectId(payslipId);
    }
    
    const payslips = await this.payslipModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    
    return payslips.map(payslip => ({
      payslipId: payslip._id,
      misconductDeductions: (payslip.deductionsDetails?.penalties as any)?.amount || 0,
      totalPenalties: (payslip.deductionsDetails?.penalties as any)?.amount || 0,
      // These would integrate with Time Management module
    }));
  }

  // REQ-PY-11: View unpaid leave deductions
  async getUnpaidLeaveDeductions(employeeId: string, payslipId?: string) {
    let query: any = { employeeId: new Types.ObjectId(employeeId) };
    
    if (payslipId) {
      query._id = new Types.ObjectId(payslipId);
    }
    
    const payslips = await this.payslipModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    
    return payslips.map(payslip => ({
      payslipId: payslip._id,
      unpaidLeaveDeduction: (payslip.deductionsDetails?.penalties as any)?.amount || 0,
      // This would integrate with Leaves module
    }));
  }

  // REQ-PY-13: View salary history
  async getSalaryHistory(employeeId: string) {
    const payslips = await this.payslipModel.find({
      employeeId: new Types.ObjectId(employeeId)
    })
    .sort({ createdAt: -1 })
    .exec();

    return payslips.map(payslip => ({
      payslipId: payslip._id,
      grossSalary: payslip.totalGrossSalary || 0,
      netSalary: payslip.netPay || 0,
      status: payslip.paymentStatus,
      totalDeductions: payslip.totaDeductions || 0,
      createdAt: (payslip as any)?.createdAt || new Date(),
    }));
  }

  // REQ-PY-14: View employer contributions
  async getEmployerContributions(employeeId: string, payslipId?: string) {
    let query: any = { employeeId: new Types.ObjectId(employeeId) };

    if (payslipId) {
      query._id = new Types.ObjectId(payslipId);
    }

    const payslips = await this.payslipModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return payslips.map(payslip => ({
      payslipId: payslip._id,
      employerContributions: payslip.earningsDetails?.benefits || [],
      totalEmployerContribution:
        payslip.earningsDetails?.benefits?.reduce(
          (sum, b) => sum + (b.amount || 0),
          0,
        ) || 0,
    }));
  }

  // REQ-PY-15: Download tax documents (metadata)
  async getTaxDocuments(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    return {
      employeeId,
      taxYear: targetYear,
      documents: [
        {
          type: 'ANNUAL_TAX_STATEMENT',
          fileName: `tax-statement-${employeeId}-${targetYear}.csv`,
          downloadUrl: `/api/payroll/tracking/employee/${employeeId}/tax-documents/${targetYear}/download`,
          generatedDate: new Date().toISOString(),
        },
      ],
    };
  }

  // REQ-PY-15 (download part): Aggregate annual tax data for download
  async downloadAnnualTaxStatement(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const payslips = await this.payslipModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    const summary = payslips.reduce(
      (acc, payslip: any) => {
        const taxableBase =
          payslip.totalGrossSalary || payslip.earningsDetails?.baseSalary || 0;
        const totalTaxForSlip = (payslip.deductionsDetails?.taxes || []).reduce(
          (sum: number, tax: any) => sum + (tax.amount || 0),
          0,
        );

        acc.totalTaxableIncome += taxableBase;
        acc.totalTaxPaid += totalTaxForSlip;
        acc.payslipsCount += 1;

        acc.payslips.push({
          payslipId: payslip._id,
          payrollRunId: payslip.payrollRunId,
          periodDate: (payslip as any)?.createdAt,
          taxableBase,
          totalTaxForSlip,
        });

        return acc;
      },
      {
        totalTaxableIncome: 0,
        totalTaxPaid: 0,
        payslipsCount: 0,
        payslips: [] as Array<{
          payslipId: string;
          payrollRunId: string;
          periodDate: Date | string;
          taxableBase: number;
          totalTaxForSlip: number;
        }>,
      },
    );

    const effectiveRatePct =
      summary.totalTaxableIncome > 0
        ? (summary.totalTaxPaid / summary.totalTaxableIncome) * 100
        : 0;

    return {
      employeeId,
      taxYear: targetYear,
      totalTaxableIncome: summary.totalTaxableIncome,
      totalTaxPaid: summary.totalTaxPaid,
      effectiveRatePct,
      payslipsCount: summary.payslipsCount,
      payslips: summary.payslips,
    };
  }

  // ========== Operational Reports Methods ==========

  // REQ-PY-38: Generate payroll reports by department
  async generateDepartmentPayrollReport(departmentId?: string, startDate?: Date, endDate?: Date) {
    const query: any = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const payslips = await this.payslipModel.find(query).exec();
    
    // Group by department (placeholder logic)
    const departmentSummary = payslips.reduce((acc, payslip) => {
      const dept = departmentId || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = {
          totalGross: 0,
          totalNet: 0,
          totalTax: 0,
          totalInsurance: 0,
          employeeCount: 0
        };
      }
      
      acc[dept].totalGross += payslip.totalGrossSalary || 0;
      acc[dept].totalNet += payslip.netPay || 0;
      acc[dept].totalTax += payslip.deductionsDetails?.taxes?.reduce((sum, t) => sum + ((t as any)?.amount || 0), 0) || 0;
      acc[dept].totalInsurance += payslip.deductionsDetails?.insurances?.reduce((sum, i) => sum + ((i as any)?.amount || 0), 0) || 0;
      acc[dept].employeeCount++;

      return acc;
    }, {});

    return {
      reportType: 'DEPARTMENT_PAYROLL_SUMMARY',
      generatedDate: new Date().toISOString(),
      filters: { departmentId, startDate, endDate },
      summary: departmentSummary,
      detailedData: payslips.map(p => ({
        employeeId: p.employeeId,
        payrollRunId: p.payrollRunId,
        grossSalary: p.totalGrossSalary,
        netSalary: p.netPay,
        totalDeductions: p.totaDeductions
      }))
    };
  }

  // REQ-PY-29: Generate month-end/year-end summaries
  async generatePayrollSummary(reportType: 'monthly' | 'yearly', period?: string) {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    if (reportType === 'monthly') {
      const yearMonth = period || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const [year, month] = yearMonth.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else { // yearly
      const year = period ? parseInt(period) : now.getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }
    
    const payslips = await this.payslipModel.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();
    
    const summary = {
      totalGross: payslips.reduce((sum, p) => sum + (p.totalGrossSalary || 0), 0),
      totalNet: payslips.reduce((sum, p) => sum + (p.netPay || 0), 0),
      totalTax: payslips.reduce((sum, p) => sum + (p.deductionsDetails?.taxes?.reduce((s, t) => s + ((t as any)?.amount || 0), 0) || 0), 0),
      totalInsurance: payslips.reduce((sum, p) => sum + (p.deductionsDetails?.insurances?.reduce((s, i) => s + ((i as any)?.amount || 0), 0) || 0), 0),
      totalPenalties: payslips.reduce((sum, p) => sum + ((p.deductionsDetails?.penalties as any)?.amount || 0), 0),
      totalEmployees: new Set(payslips.map(p => p.employeeId.toString())).size,
      totalPayslips: payslips.length
    };
    
    return {
      reportType: `${reportType.toUpperCase()}_PAYROLL_SUMMARY`,
      period: reportType === 'monthly' 
        ? `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`
        : startDate.getFullYear().toString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      generatedDate: new Date().toISOString(),
      summary,
      byDepartment: this.groupByDepartment(payslips)
    };
  }

  // REQ-PY-25: Generate tax/insurance/benefits reports
  async generateComplianceReport(reportType: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    const payslips = await this.payslipModel.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();
    
    let reportData;

    switch (reportType.toLowerCase()) {
      case 'tax':
        reportData = this.generateTaxReport(payslips, targetYear);
        break;
      case 'insurance':
        reportData = this.generateInsuranceReport(payslips, targetYear);
        break;
      case 'benefits':
        reportData = this.generateBenefitsReport(payslips, targetYear);
        break;
      default:
        throw new BadRequestException('Invalid report type');
    }

    return reportData;
  }

  // ========== Disputes and Claims Approval Methods ==========

  // REQ-PY-39: Payroll Specialist approve/reject disputes
  async reviewDispute(disputeId: string, specialistId: string, action: 'approve' | 'reject', reason?: string) {
    const dispute = await this.disputesModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    
    if (action === 'approve') {
      dispute.status = DisputeStatus.APPROVED;
      dispute.resolutionComment = reason || 'Approved by Payroll Specialist';
    } else {
      dispute.status = DisputeStatus.REJECTED;
      dispute.rejectionReason = reason || 'Rejected by Payroll Specialist';
    }
    
    return dispute.save();
  }

  // REQ-PY-40: Payroll Manager confirm dispute approval (multi-step)
  async confirmDisputeApproval(disputeId: string, managerId: string, action: 'confirm' | 'reject', reason?: string) {
    const dispute = await this.disputesModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    
    if (dispute.status !== DisputeStatus.APPROVED) {
      throw new BadRequestException('Only approved disputes can be confirmed by manager');
    }
    
    if (action === 'confirm') {
      // Dispute is now ready for finance processing
      dispute.resolutionComment = reason || `Confirmed by Payroll Manager ${managerId}`;
      // Trigger notification to finance staff (REQ-PY-41)
    } else {
      dispute.status = DisputeStatus.UNDER_REVIEW;
      dispute.rejectionReason = reason || 'Rejected by Payroll Manager';
    }
    
    return dispute.save();
  }

  // REQ-PY-41: Finance staff view approved disputes
  async getApprovedDisputes(financeStaffId?: string) {
    const query: any = { status: DisputeStatus.APPROVED };
    
    if (financeStaffId) {
      query.financeStaffId = new Types.ObjectId(financeStaffId);
    }

    return this.disputesModel.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('payslipId', 'payPeriod netSalary')
      .exec();
  }

  // REQ-PY-42: Payroll Specialist approve/reject claims
  async reviewClaim(claimId: string, specialistId: string, action: 'approve' | 'reject', approvedAmount?: number, reason?: string) {
    const claim = await this.claimsModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    
    if (action === 'approve') {
      claim.status = ClaimStatus.APPROVED;
      claim.approvedAmount = approvedAmount || claim.amount;
      claim.resolutionComment = reason || 'Approved by Payroll Specialist';
    } else {
      claim.status = ClaimStatus.REJECTED;
      claim.rejectionReason = reason || 'Rejected by Payroll Specialist';
    }
    
    return claim.save();
  }

  // REQ-PY-43: Payroll Manager confirm claim approval
  async confirmClaimApproval(claimId: string, managerId: string, action: 'confirm' | 'reject', reason?: string) {
    const claim = await this.claimsModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    
    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException('Only approved claims can be confirmed by manager');
    }
    
    if (action === 'confirm') {
      claim.resolutionComment = reason || `Confirmed by Payroll Manager ${managerId}`;
      // Trigger notification to finance staff (REQ-PY-44)
    } else {
      claim.status = ClaimStatus.UNDER_REVIEW;
      claim.rejectionReason = reason || 'Rejected by Payroll Manager';
    }
    
    return claim.save();
  }

  // REQ-PY-44: Finance staff view approved claims
  async getApprovedClaims(financeStaffId?: string) {
    const query: any = { status: ClaimStatus.APPROVED };
    
    if (financeStaffId) {
      query.financeStaffId = new Types.ObjectId(financeStaffId);
    }

    return this.claimsModel.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .exec();
  }

  // ========== Refund Process Methods ==========

  // REQ-PY-45: Generate refund for disputes
  async generateDisputeRefund(disputeId: string, financeStaffId: string, amount: number, description: string) {
    const dispute = await this.disputesModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    
    if (dispute.status !== DisputeStatus.APPROVED) {
      throw new BadRequestException('Only approved disputes can generate refunds');
    }

    // Check if refund already exists
    const existingRefund = await this.refundsModel.findOne({ disputeId: new Types.ObjectId(disputeId) });
    if (existingRefund) {
      throw new BadRequestException('Refund already exists for this dispute');
    }
    
    const refund = new this.refundsModel({
      disputeId: new Types.ObjectId(disputeId),
      employeeId: dispute.employeeId,
      financeStaffId: new Types.ObjectId(financeStaffId),
      refundDetails: {
        description,
        amount
      },
      status: RefundStatus.PENDING
    });
    
    return refund.save();
  }

  // REQ-PY-46: Generate refund for expense claims
  async generateClaimRefund(claimId: string, financeStaffId: string, amount: number, description: string) {
    const claim = await this.claimsModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    
    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException('Only approved claims can generate refunds');
    }

    // Check if refund already exists
    const existingRefund = await this.refundsModel.findOne({ claimId: new Types.ObjectId(claimId) });
    if (existingRefund) {
      throw new BadRequestException('Refund already exists for this claim');
    }
    
    const refund = new this.refundsModel({
      claimId: new Types.ObjectId(claimId),
      employeeId: claim.employeeId,
      financeStaffId: new Types.ObjectId(financeStaffId),
      refundDetails: {
        description,
        amount
      },
      status: RefundStatus.PENDING
    });
    
    return refund.save();
  }

  // Get pending refunds
  async getPendingRefunds() {
    return this.refundsModel.find({ status: RefundStatus.PENDING })
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('claimId', 'claimId description')
      .populate('disputeId', 'disputeId description')
      .exec();
  }

  // Update refund status when paid in payroll run
  async markRefundAsPaid(refundId: string, payrollRunId: string) {
    const refund = await this.refundsModel.findById(refundId);
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.PAID;
    refund.paidInPayrollRunId = new Types.ObjectId(payrollRunId);
    
    return refund.save();
  }

  // ========== Helper Methods ==========

  private groupByDepartment(payslips: any[]) {
    return payslips.reduce((acc, payslip) => {
      const dept = 'Unknown'; // Department info would need to be populated from employee
      if (!acc[dept]) {
        acc[dept] = {
          totalGross: 0,
          totalNet: 0,
          employeeCount: new Set()
        };
      }

      acc[dept].totalGross += payslip.totalGrossSalary || 0;
      acc[dept].totalNet += payslip.netPay || 0;
      acc[dept].employeeCount.add(payslip.employeeId.toString());

      return acc;
    }, {});
  }

  private generateTaxReport(payslips: any[], year: number) {
    const taxSummary = payslips.reduce((acc, payslip) => {
      const employeeId = payslip.employeeId.toString();
      if (!acc[employeeId]) {
        acc[employeeId] = {
          totalTax: 0,
          taxBreakdown: {},
          payslipsCount: 0
        };
      }
      
      const totalTax = payslip.deductionsDetails?.taxes?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0;
      acc[employeeId].totalTax += totalTax;
      acc[employeeId].payslipsCount++;
      
      // Aggregate by tax type if available
      if (payslip.deductionsDetails?.taxes && Array.isArray(payslip.deductionsDetails.taxes)) {
        payslip.deductionsDetails.taxes.forEach((tax: any) => {
          const taxType = tax.type || 'Unknown';
          if (!acc[employeeId].taxBreakdown[taxType]) {
            acc[employeeId].taxBreakdown[taxType] = 0;
          }
          acc[employeeId].taxBreakdown[taxType] += tax.amount || 0;
        });
      }
      
      return acc;
    }, {});
    
    return {
      reportType: 'TAX_COMPLIANCE_REPORT',
      year,
      generatedDate: new Date().toISOString(),
      totalEmployees: Object.keys(taxSummary).length,
      totalTaxCollected: Object.values(taxSummary).reduce((sum: number, emp: any) => sum + emp.totalTax, 0),
      employeeTaxDetails: taxSummary
    };
  }

  private generateInsuranceReport(payslips: any[], year: number) {
    const insuranceSummary = payslips.reduce((acc, payslip) => {
      const employeeId = payslip.employeeId.toString();
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employeeContribution: 0,
          insuranceBreakdown: {},
          payslipsCount: 0
        };
      }
      
      const totalInsurance = payslip.deductionsDetails?.insurances?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
      acc[employeeId].employeeContribution += totalInsurance;
      acc[employeeId].payslipsCount++;
      
      // Aggregate by insurance type if available
      if (payslip.deductionsDetails?.insurances && Array.isArray(payslip.deductionsDetails.insurances)) {
        payslip.deductionsDetails.insurances.forEach((insurance: any) => {
          const insuranceType = insurance.type || 'Unknown';
          if (!acc[employeeId].insuranceBreakdown[insuranceType]) {
            acc[employeeId].insuranceBreakdown[insuranceType] = 0;
          }
          acc[employeeId].insuranceBreakdown[insuranceType] += insurance.amount || 0;
        });
      }
      
      return acc;
    }, {});
    
    return {
      reportType: 'INSURANCE_CONTRIBUTIONS_REPORT',
      year,
      generatedDate: new Date().toISOString(),
      totalEmployees: Object.keys(insuranceSummary).length,
      totalEmployeeContributions: Object.values(insuranceSummary).reduce((sum: number, emp: any) => sum + emp.employeeContribution, 0),
      insuranceDetails: insuranceSummary
    };
  }

  private generateBenefitsReport(payslips: any[], year: number) {
    const benefitsSummary = payslips.reduce((acc, payslip) => {
      const employeeId = payslip.employeeId.toString();
      if (!acc[employeeId]) {
        acc[employeeId] = {
          totalBenefits: 0,
          benefitsBreakdown: {},
          payslipsCount: 0
        };
      }
      
      // Sum up all benefits
      if (payslip.earningsDetails?.benefits && Array.isArray(payslip.earningsDetails.benefits)) {
        payslip.earningsDetails.benefits.forEach((benefit: any) => {
          const benefitType = benefit.type || 'Unknown';
          if (!acc[employeeId].benefitsBreakdown[benefitType]) {
            acc[employeeId].benefitsBreakdown[benefitType] = 0;
          }
          acc[employeeId].benefitsBreakdown[benefitType] += benefit.amount || 0;
          acc[employeeId].totalBenefits += benefit.amount || 0;
        });
      }
      
      acc[employeeId].payslipsCount++;
      
      return acc;
    }, {});
    
    return {
      reportType: 'BENEFITS_REPORT',
      year,
      generatedDate: new Date().toISOString(),
      totalEmployees: Object.keys(benefitsSummary).length,
      totalBenefitsProvided: Object.values(benefitsSummary).reduce((sum: number, emp: any) => sum + emp.totalBenefits, 0),
      benefitsDetails: benefitsSummary
    };
  }

  // ========== CRUD Methods for Claims ==========

  async getAllClaims(status?: string, employeeId?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = new Types.ObjectId(employeeId);

    return this.claimsModel.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .exec();
  }

  async getClaimById(id: string) {
    const claim = await this.claimsModel.findById(id)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .exec();
    
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    
    return claim;
  }

  async updateClaimById(id: string, updateClaimDto: any) {
    const claim = await this.claimsModel.findByIdAndUpdate(
      id,
      updateClaimDto,
      { new: true }
    ).exec();
    
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  async deleteClaimById(id: string) {
    const result = await this.claimsModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Claim not found');
    }
  }

  // ========== CRUD Methods for Disputes ==========

  async getAllDisputes(status?: string, employeeId?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = new Types.ObjectId(employeeId);

    return this.disputesModel.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('payslipId', 'payPeriod netSalary')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .exec();
  }

  async getDisputeById(id: string) {
    const dispute = await this.disputesModel.findById(id)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('payslipId', 'payPeriod netSalary grossSalary')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .exec();
    
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    
    return dispute;
  }

  async updateDisputeById(id: string, updateDisputeDto: any) {
    const dispute = await this.disputesModel.findByIdAndUpdate(
      id,
      updateDisputeDto,
      { new: true }
    ).exec();
    
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async deleteDisputeById(id: string) {
    const result = await this.disputesModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Dispute not found');
    }
  }

  // ========== CRUD Methods for Refunds ==========

  async getAllRefunds(status?: string, employeeId?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = new Types.ObjectId(employeeId);
    
    return this.refundsModel.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('claimId', 'claimId description')
      .populate('disputeId', 'disputeId description')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .populate('paidInPayrollRunId', 'runId period')
      .exec();
  }

  async getRefundById(id: string) {
    const refund = await this.refundsModel.findById(id)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('claimId', 'claimId description amount')
      .populate('disputeId', 'disputeId description')
      .populate('financeStaffId', 'firstName lastName employeeId')
      .populate('paidInPayrollRunId', 'runId period')
      .exec();
    
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }
    
    return refund;
  }

  async updateRefundById(id: string, updateRefundDto: any) {
    const refund = await this.refundsModel.findByIdAndUpdate(
      id,
      updateRefundDto,
      { new: true }
    ).exec();
    
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async deleteRefundById(id: string) {
    const result = await this.refundsModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Refund not found');
    }
  }

// Add these methods to your existing PayrollTrackingService class:

// REQ-PY-16: Dispute payroll errors
async createDispute(employeeId: string, createDisputeDto: any) {
  // Generate dispute ID
  const latestDispute = await this.disputesModel.findOne()
    .sort({ createdAt: -1 })
    .exec();

  let nextNumber = 1;
  if (latestDispute && latestDispute.disputeId) {
    const match = latestDispute.disputeId.match(/DISP-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const disputeId = `DISP-${nextNumber.toString().padStart(4, '0')}`;

  const dispute = new this.disputesModel({
    disputeId,
    employeeId: new Types.ObjectId(employeeId),
    ...createDisputeDto,
    payslipId: new Types.ObjectId(createDisputeDto.payslipId),
    status: DisputeStatus.UNDER_REVIEW
  });

  return dispute.save();
}

// REQ-PY-17: Submit expense reimbursement claims
async createClaim(employeeId: string, createClaimDto: any) {
  // Generate claim ID
  const latestClaim = await this.claimsModel.findOne()
    .sort({ createdAt: -1 })
    .exec();

  let nextNumber = 1;
  if (latestClaim && latestClaim.claimId) {
    const match = latestClaim.claimId.match(/CLAIM-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const claimId = `CLAIM-${nextNumber.toString().padStart(4, '0')}`;

  const claim = new this.claimsModel({
    claimId,
    employeeId: new Types.ObjectId(employeeId),
    ...createClaimDto,
    status: ClaimStatus.UNDER_REVIEW
  });

  return claim.save();
}

// REQ-PY-18: Track the approval and payment status of my claims, disputes
  async trackClaimsAndDisputes(employeeId: string) {
    const [claimsList, disputesList] = await Promise.all([
      this.claimsModel
        .find({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .exec(),
      this.disputesModel
        .find({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return {
      claims: claimsList.map((claim) => ({
        id: claim._id,
        claimId: claim.claimId,
        description: claim.description,
        claimType: (claim as any).claimType,
        amount: claim.amount,
        approvedAmount: claim.approvedAmount,
        status: claim.status,
        createdAt: (claim as any).createdAt,
        updatedAt: (claim as any).updatedAt,
      })),
      disputes: disputesList.map((dispute) => ({
        id: dispute._id,
        disputeId: dispute.disputeId,
        description: dispute.description,
        payslipId: dispute.payslipId,
        status: dispute.status,
        createdAt: (dispute as any).createdAt,
        updatedAt: (dispute as any).updatedAt,
      })),
    };
  }

}
