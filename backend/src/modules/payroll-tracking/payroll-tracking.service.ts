import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { refunds } from '../../schemas/payroll-tracking/refunds.schema';
import { claims } from '../../schemas/payroll-tracking/claims.schema';
import { disputes } from '../../schemas/payroll-tracking/disputes.schema';
import { ClaimStatus, DisputeStatus, RefundStatus } from '../../enums/payroll-tracking/payroll-tracking-enum';
import { SystemRole } from './shared/system-role.enum';
import { JwtPayload } from './shared/jwt-payload.interface';

// DTOs
import { CreateDisputeDTO } from './dto/create-dispute.dto';
import { CreateClaimDTO } from './dto/create-claim.dto';
import { ApproveRejectDisputeDTO } from './dto/approve-reject-dispute.dto';
import { ApproveRejectClaimDTO } from './dto/approve-reject-claim.dto';
import { PayrollReportFilterDTO } from './dto/payroll-report-filter.dto';
import { MonthEndYearEndReportFilterDTO } from './dto/month-end-year-end-report.dto';

@Injectable()
export class PayrollTrackingService {
    constructor(
        @InjectModel(refunds.name) private refundsModel: Model<refunds>,
        @InjectModel(claims.name) private claimsModel: Model<claims>,
        @InjectModel(disputes.name) private disputesModel: Model<disputes>,
    ) { }

    // ============ DISPUTES MANAGEMENT ============

    /**
     * Create a new dispute by an employee
     * Business Rule: Employee can raise disputes against their payslip
     * @param createDisputeDTO - Contains description and payslipId
     * @param currentUser - JWT payload of the employee creating the dispute
     */
    async createDispute(createDisputeDTO: CreateDisputeDTO, currentUser: JwtPayload): Promise<disputes> {
        try {
            // TODO: Validate if payslip exists and belongs to the employee
            // TODO: Fetch payslip details from payroll-execution module

            // Generate unique dispute ID (format: DISP-XXXX)
            const disputeCount = await this.disputesModel.countDocuments();
            const disputeId = `DISP-${String(disputeCount + 1).padStart(4, '0')}`;

            const dispute = new this.disputesModel({
                disputeId,
                description: createDisputeDTO.description,
                employeeId: currentUser.sub,
                payslipId: createDisputeDTO.payslipId,
                status: DisputeStatus.UNDER_REVIEW,
            });

            return await dispute.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to create dispute: ${error.message}`);
        }
    }

    /**
     * Payroll Specialist: View all disputes for approval/rejection
     * Business Rule: Payroll Specialist can view and approve/reject disputes
     * @param currentUser - JWT payload of the payroll specialist
     */
    async getDisputesForPayrollSpecialist(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: disputes[], total: number }> {
        try {
            // Verify user is Payroll Specialist
            if (!currentUser.roles?.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Only Payroll Specialists can view disputes for approval');
            }

            const [data, total] = await Promise.all([
                this.disputesModel
                    .find({ status: DisputeStatus.UNDER_REVIEW })
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec(),
                this.disputesModel.countDocuments({ status: DisputeStatus.UNDER_REVIEW }),
            ]);

            return { data, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve disputes: ${error.message}`);
        }
    }

    /**
     * Payroll Specialist: Approve or Reject a dispute
     * Business Rule: Only approved disputes will reach Payroll Manager for final decision
     * @param disputeId - MongoDB ObjectId of the dispute
     * @param approveRejectDTO - Contains status (approved/rejected) and optional comments
     * @param currentUser - JWT payload of the payroll specialist
     */
    async approveRejectDisputeBySpecialist(
        disputeId: string,
        approveRejectDTO: ApproveRejectDisputeDTO,
        currentUser: JwtPayload
    ): Promise<disputes> {
        try {
            // Verify user is Payroll Specialist
            if (!currentUser.roles?.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Only Payroll Specialists can approve/reject disputes');
            }

            // Validate that status is either APPROVED or REJECTED (not UNDER_REVIEW)
            if (approveRejectDTO.status === DisputeStatus.UNDER_REVIEW) {
                throw new BadRequestException('Cannot transition dispute back to UNDER_REVIEW status');
            }

            const dispute = await this.disputesModel.findById(disputeId);
            if (!dispute) {
                throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
            }

            if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
                throw new BadRequestException('Can only approve/reject disputes in UNDER_REVIEW status');
            }

            // Update dispute with Specialist's decision
            dispute.status = approveRejectDTO.status;
            if (approveRejectDTO.rejectionReason) {
                dispute.rejectionReason = approveRejectDTO.rejectionReason;
            }
            if (approveRejectDTO.resolutionComment) {
                dispute.resolutionComment = approveRejectDTO.resolutionComment;
            }

            return await dispute.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to approve/reject dispute: ${error.message}`);
        }
    }

    /**
     * Payroll Manager: Confirm approval of disputes (Multi-step approval)
     * Business Rule: Only approved disputes reach Payroll Manager for final decision
     * @param disputeId - MongoDB ObjectId of the dispute
     * @param approveRejectDTO - Contains final status and optional comments
     * @param currentUser - JWT payload of the payroll manager
     */
    async confirmDisputeApprovalByManager(
        disputeId: string,
        approveRejectDTO: ApproveRejectDisputeDTO,
        currentUser: JwtPayload
    ): Promise<disputes> {
        try {
            // TODO: Verify user role - Payroll Manager or Finance Manager
            // NOTE: Need to check if PAYROLL_MANAGER role exists in SystemRole enum

            const dispute = await this.disputesModel.findById(disputeId);
            if (!dispute) {
                throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
            }

            // Only approved disputes can reach this stage
            if (dispute.status !== DisputeStatus.APPROVED) {
                throw new BadRequestException('Only approved disputes can be confirmed by manager');
            }

            // Manager can approve or reject the already-approved dispute
            dispute.status = approveRejectDTO.status;
            if (approveRejectDTO.resolutionComment) {
                dispute.resolutionComment = approveRejectDTO.resolutionComment;
            }

            return await dispute.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to confirm dispute approval: ${error.message}`);
        }
    }

    /**
     * Finance Staff: View approved disputes and get notified
     * Business Rule: Finance staff can view only approved disputes for adjustments
     * @param currentUser - JWT payload of finance staff
     */
    async getApprovedDisputesForFinanceStaff(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: disputes[], total: number }> {
        try {
            // Verify user is Finance Staff
            if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
                throw new ForbiddenException('Only Finance Staff can view approved disputes');
            }

            const [data, total] = await Promise.all([
                this.disputesModel
                    .find({ status: DisputeStatus.APPROVED })
                    .skip(skip)
                    .limit(limit)
                    .sort({ updatedAt: -1 })
                    .exec(),
                this.disputesModel.countDocuments({ status: DisputeStatus.APPROVED }),
            ]);

            // TODO: Send notification to Finance Staff about approved disputes
            // TODO: Implement notification service integration

            return { data, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve approved disputes: ${error.message}`);
        }
    }

    /**
     * Get single dispute by ID
     * @param disputeId - MongoDB ObjectId of the dispute
     * @param currentUser - JWT payload of the requesting user
     */
    async getDisputeById(disputeId: string, currentUser: JwtPayload): Promise<disputes> {
        try {
            const dispute = await this.disputesModel.findById(disputeId);
            if (!dispute) {
                throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
            }

            // TODO: Implement access control - user should be able to view only their own disputes or based on their role
            return dispute;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve dispute: ${error.message}`);
        }
    }

    // ============ EXPENSE CLAIMS MANAGEMENT ============

    /**
     * Create a new expense claim by an employee
     * Business Rule: Employee can submit expense claims
     * @param createClaimDTO - Contains description, claimType, and amount
     * @param currentUser - JWT payload of the employee creating the claim
     */
    async createExpenseClaim(createClaimDTO: CreateClaimDTO, currentUser: JwtPayload): Promise<claims> {
        try {
            const amount = parseFloat(createClaimDTO.amount);
            if (amount <= 0) {
                throw new BadRequestException('Claim amount must be greater than 0');
            }

            // Generate unique claim ID (format: CLAIM-XXXX)
            const claimCount = await this.claimsModel.countDocuments();
            const claimId = `CLAIM-${String(claimCount + 1).padStart(4, '0')}`;

            const claim = new this.claimsModel({
                claimId,
                description: createClaimDTO.description,
                claimType: createClaimDTO.claimType,
                amount,
                employeeId: currentUser.sub,
                status: ClaimStatus.UNDER_REVIEW,
            });

            return await claim.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to create expense claim: ${error.message}`);
        }
    }

    /**
     * Payroll Specialist: View all expense claims for approval/rejection
     * Business Rule: Payroll Specialist can view and approve/reject expense claims
     * @param currentUser - JWT payload of the payroll specialist
     */
    async getExpenseClaimsForPayrollSpecialist(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: claims[], total: number }> {
        try {
            // Verify user is Payroll Specialist
            if (!currentUser.roles?.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Only Payroll Specialists can view claims for approval');
            }

            const [data, total] = await Promise.all([
                this.claimsModel
                    .find({ status: ClaimStatus.UNDER_REVIEW })
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec(),
                this.claimsModel.countDocuments({ status: ClaimStatus.UNDER_REVIEW }),
            ]);

            return { data, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve expense claims: ${error.message}`);
        }
    }

    /**
     * Payroll Specialist: Approve or Reject an expense claim
     * Business Rule: Only approved claims will reach Payroll Manager for final decision
     * @param claimId - MongoDB ObjectId of the claim
     * @param approveRejectDTO - Contains status and optional approved amount and comments
     * @param currentUser - JWT payload of the payroll specialist
     */
    async approveRejectExpenseClaimBySpecialist(
        claimId: string,
        approveRejectDTO: ApproveRejectClaimDTO,
        currentUser: JwtPayload
    ): Promise<claims> {
        try {
            // Verify user is Payroll Specialist
            if (!currentUser.roles?.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Only Payroll Specialists can approve/reject claims');
            }

            // Validate that status is either APPROVED or REJECTED
            if (approveRejectDTO.status === ClaimStatus.UNDER_REVIEW) {
                throw new BadRequestException('Cannot transition claim back to UNDER_REVIEW status');
            }

            const claim = await this.claimsModel.findById(claimId);
            if (!claim) {
                throw new NotFoundException(`Claim with ID ${claimId} not found`);
            }

            if (claim.status !== ClaimStatus.UNDER_REVIEW) {
                throw new BadRequestException('Can only approve/reject claims in UNDER_REVIEW status');
            }

            // Validate approved amount if provided and status is APPROVED
            if (approveRejectDTO.status === ClaimStatus.APPROVED && approveRejectDTO.approvedAmount !== undefined) {
                if (approveRejectDTO.approvedAmount < 0 || approveRejectDTO.approvedAmount > claim.amount) {
                    throw new BadRequestException('Approved amount must be between 0 and claim amount');
                }
                claim.approvedAmount = approveRejectDTO.approvedAmount;
            }

            // Update claim with Specialist's decision
            claim.status = approveRejectDTO.status;
            if (approveRejectDTO.rejectionReason) {
                claim.rejectionReason = approveRejectDTO.rejectionReason;
            }
            if (approveRejectDTO.resolutionComment) {
                claim.resolutionComment = approveRejectDTO.resolutionComment;
            }

            return await claim.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to approve/reject expense claim: ${error.message}`);
        }
    }

    /**
     * Payroll Manager: Confirm approval of expense claims (Multi-step approval)
     * Business Rule: Only approved claims reach Payroll Manager for final decision
     * @param claimId - MongoDB ObjectId of the claim
     * @param approveRejectDTO - Contains final status and optional comments
     * @param currentUser - JWT payload of the payroll manager
     */
    async confirmExpenseClaimApprovalByManager(
        claimId: string,
        approveRejectDTO: ApproveRejectClaimDTO,
        currentUser: JwtPayload
    ): Promise<claims> {
        try {
            // TODO: Verify user role - Payroll Manager or Finance Manager
            // NOTE: Need to check if PAYROLL_MANAGER role exists in SystemRole enum

            const claim = await this.claimsModel.findById(claimId);
            if (!claim) {
                throw new NotFoundException(`Claim with ID ${claimId} not found`);
            }

            // Only approved claims can reach this stage
            if (claim.status !== ClaimStatus.APPROVED) {
                throw new BadRequestException('Only approved claims can be confirmed by manager');
            }

            // Manager can approve or reject the already-approved claim
            claim.status = approveRejectDTO.status;
            if (approveRejectDTO.resolutionComment) {
                claim.resolutionComment = approveRejectDTO.resolutionComment;
            }

            return await claim.save();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to confirm claim approval: ${error.message}`);
        }
    }

    /**
     * Finance Staff: View approved expense claims and get notified
     * Business Rule: Finance staff can view only approved claims for processing adjustments
     * @param currentUser - JWT payload of finance staff
     */
    async getApprovedExpenseClaimsForFinanceStaff(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: claims[], total: number }> {
        try {
            // Verify user is Finance Staff
            if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
                throw new ForbiddenException('Only Finance Staff can view approved expense claims');
            }

            const [data, total] = await Promise.all([
                this.claimsModel
                    .find({ status: ClaimStatus.APPROVED })
                    .skip(skip)
                    .limit(limit)
                    .sort({ updatedAt: -1 })
                    .exec(),
                this.claimsModel.countDocuments({ status: ClaimStatus.APPROVED }),
            ]);

            // TODO: Send notification to Finance Staff about approved expense claims
            // TODO: Implement notification service integration

            return { data, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve approved expense claims: ${error.message}`);
        }
    }

    /**
     * Get single expense claim by ID
     * @param claimId - MongoDB ObjectId of the claim
     * @param currentUser - JWT payload of the requesting user
     */
    async getExpenseClaimById(claimId: string, currentUser: JwtPayload): Promise<claims> {
        try {
            const claim = await this.claimsModel.findById(claimId);
            if (!claim) {
                throw new NotFoundException(`Claim with ID ${claimId} not found`);
            }

            // TODO: Implement access control - user should be able to view only their own claims or based on their role
            return claim;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve expense claim: ${error.message}`);
        }
    }

    // ============ PAYROLL REPORTS ============

    /**
     * Generate payroll report by department (Payroll Specialist)
     * Business Rule: Payroll Specialist can generate payroll reports filtered by department
     * Report includes: salary distribution, deductions, net pay by department
     * @param filterDTO - Contains startDate, endDate, departmentId
     * @param currentUser - JWT payload of the payroll specialist
     */
    async generatePayrollReportByDepartment(
        filterDTO: PayrollReportFilterDTO,
        currentUser: JwtPayload
    ): Promise<any> {
        try {
            // Verify user is Payroll Specialist
            if (!currentUser.roles?.includes(SystemRole.PAYROLL_SPECIALIST)) {
                throw new ForbiddenException('Only Payroll Specialists can generate payroll reports by department');
            }

            // TODO: Fetch payslips from payroll-execution module filtered by:
            // - Date range (filterDTO.startDate, filterDTO.endDate)
            // - Department (filterDTO.departmentId)
            // TODO: Aggregate payslip data to calculate:
            // - Total gross salary per department
            // - Total deductions per department
            // - Total net pay per department
            // - Employee count per department
            // - Average salary per department

            const reportData = {
                reportType: 'Payroll Report by Department',
                generatedAt: new Date(),
                filters: filterDTO,
                generatedBy: currentUser.sub,
                // TODO: Add aggregated data here
                summary: {
                    totalEmployees: 0,
                    totalGrossSalary: 0,
                    totalDeductions: 0,
                    totalNetPay: 0,
                    averageSalary: 0,
                },
                departmentBreakdown: [],
            };

            return reportData;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to generate payroll report: ${error.message}`);
        }
    }

    /**
     * Generate month-end and year-end payroll summaries (Finance Staff)
     * Business Rule: Finance staff generates comprehensive payroll summaries for month-end and year-end
     * Report includes: total payroll expenses, tax reports, insurance contributions, benefits
     * @param filterDTO - Contains startDate, endDate, reportType
     * @param currentUser - JWT payload of the finance staff
     */
    async generateMonthEndYearEndSummary(
        filterDTO: MonthEndYearEndReportFilterDTO,
        currentUser: JwtPayload
    ): Promise<any> {
        try {
            // Verify user is Finance Staff
            if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
                throw new ForbiddenException('Only Finance Staff can generate month-end and year-end summaries');
            }

            const reportType = filterDTO.reportType || 'month-end';

            // TODO: Fetch payslips from payroll-execution module filtered by:
            // - Date range (filterDTO.startDate, filterDTO.endDate)
            // TODO: Aggregate payslip data to calculate:
            // - Total payroll expenses
            // - Total taxes withheld
            // - Total insurance contributions
            // - Total benefits paid
            // - Total allowances
            // - Total bonuses
            // - Net payroll

            const summaryData = {
                reportType: `${reportType.replace('-', ' ').toUpperCase()} PAYROLL SUMMARY`,
                period: {
                    startDate: filterDTO.startDate,
                    endDate: filterDTO.endDate,
                },
                generatedAt: new Date(),
                generatedBy: currentUser.sub,
                summary: {
                    totalPayrollExpense: 0,
                    totalGrossSalary: 0,
                    totalDeductions: 0,
                    totalNetPay: 0,
                    totalTaxes: 0,
                    totalInsuranceContributions: 0,
                    totalBenefits: 0,
                    totalAllowances: 0,
                    totalBonuses: 0,
                    employeeCount: 0,
                },
                // TODO: Add breakdown by employee, department, or cost center
                breakdownByEmployee: [],
            };

            return summaryData;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to generate month-end/year-end summary: ${error.message}`);
        }
    }

    /**
     * Generate tax, insurance, and benefits report (Finance Staff)
     * Business Rule: Finance staff generates detailed reports on taxes, insurance contributions, and benefits
     * Report includes: tax breakdown by employee, insurance contributions, benefits paid
     * @param filterDTO - Contains startDate, endDate
     * @param currentUser - JWT payload of the finance staff
     */
    async generateTaxInsuranceBenefitsReport(
        filterDTO: MonthEndYearEndReportFilterDTO,
        currentUser: JwtPayload
    ): Promise<any> {
        try {
            // Verify user is Finance Staff
            if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
                throw new ForbiddenException('Only Finance Staff can generate tax, insurance, and benefits reports');
            }

            // TODO: Fetch payslips from payroll-execution module filtered by:
            // - Date range (filterDTO.startDate, filterDTO.endDate)
            // TODO: Extract and aggregate:
            // - Tax information from deductions details
            // - Insurance information from deductions details
            // - Benefits information from earnings details

            const reportData = {
                reportType: 'TAX, INSURANCE & BENEFITS REPORT',
                period: {
                    startDate: filterDTO.startDate,
                    endDate: filterDTO.endDate,
                },
                generatedAt: new Date(),
                generatedBy: currentUser.sub,
                summary: {
                    totalTaxes: 0,
                    totalInsuranceContributions: 0,
                    totalBenefits: 0,
                    employeeCount: 0,
                },
                taxBreakdown: {
                    byType: {},
                    byEmployee: [],
                },
                insuranceBreakdown: {
                    byType: {},
                    byEmployee: [],
                },
                benefitsBreakdown: {
                    byType: {},
                    byEmployee: [],
                },
                // TODO: Add compliance information for accounting books
                complianceNotes: [],
            };

            return reportData;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to generate tax, insurance, and benefits report: ${error.message}`);
        }
    }

    // // ============ REFUND PROCESS ============

    // /**
    //  * Generate refund for approved dispute (Finance Staff)
    //  * Business Rule: Finance staff generates refund for approved disputes
    //  * The refund will be included in the next payroll cycle
    //  * @param disputeId - MongoDB ObjectId of the dispute
    //  * @param generateRefundDTO - Contains refund amount and optional description
    //  * @param currentUser - JWT payload of finance staff
    //  */
    // async generateRefundForDispute(
    //     disputeId: string,
    //     generateRefundDTO: any, // GenerateRefundForDisputeDTO
    //     currentUser: JwtPayload
    // ): Promise<refunds> {
    //     try {
    //         // Verify user is Finance Staff
    //         if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
    //             throw new ForbiddenException('Only Finance Staff can generate refunds for disputes');
    //         }

    //         // Verify refund amount is valid
    //         if (generateRefundDTO.refundAmount <= 0) {
    //             throw new BadRequestException('Refund amount must be greater than 0');
    //         }

    //         // Get the dispute
    //         const dispute = await this.disputesModel.findById(disputeId);
    //         if (!dispute) {
    //             throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
    //         }

    //         // Verify dispute is approved
    //         if (dispute.status !== DisputeStatus.APPROVED) {
    //             throw new BadRequestException('Can only generate refund for approved disputes');
    //         }

    //         // Check if refund already exists for this dispute
    //         const existingRefund = await this.refundsModel.findOne({ disputeId });
    //         if (existingRefund) {
    //             throw new BadRequestException('Refund already exists for this dispute');
    //         }

    //         // Create refund record
    //         const refund = new this.refundsModel({
    //             disputeId,
    //             refundDetails: {
    //                 description: generateRefundDTO.description || `Refund for dispute ${dispute.disputeId}`,
    //                 amount: generateRefundDTO.refundAmount,
    //             },
    //             employeeId: dispute.employeeId,
    //             financeStaffId: currentUser.sub,
    //             status: RefundStatus.PENDING, // Will be marked PAID when payroll runs
    //         });

    //         return await refund.save();
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to generate refund for dispute: ${error.message}`);
    //     }
    // }

    // /**
    //  * Generate refund for approved expense claim (Finance Staff)
    //  * Business Rule: Finance staff generates refund for approved expense claims
    //  * The refund will be included in the next payroll cycle
    //  * @param claimId - MongoDB ObjectId of the claim
    //  * @param generateRefundDTO - Contains refund amount and optional description
    //  * @param currentUser - JWT payload of finance staff
    //  */
    // async generateRefundForExpenseClaim(
    //     claimId: string,
    //     generateRefundDTO: any, // GenerateRefundForExpenseClaimDTO
    //     currentUser: JwtPayload
    // ): Promise<refunds> {
    //     try {
    //         // Verify user is Finance Staff
    //         if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
    //             throw new ForbiddenException('Only Finance Staff can generate refunds for expense claims');
    //         }

    //         // Verify refund amount is valid
    //         if (generateRefundDTO.refundAmount <= 0) {
    //             throw new BadRequestException('Refund amount must be greater than 0');
    //         }

    //         // Get the claim
    //         const claim = await this.claimsModel.findById(claimId);
    //         if (!claim) {
    //             throw new NotFoundException(`Claim with ID ${claimId} not found`);
    //         }

    //         // Verify claim is approved
    //         if (claim.status !== ClaimStatus.APPROVED) {
    //             throw new BadRequestException('Can only generate refund for approved expense claims');
    //         }

    //         // Validate refund amount does not exceed approved amount
    //         const approvedAmount = claim.approvedAmount || claim.amount;
    //         if (generateRefundDTO.refundAmount > approvedAmount) {
    //             throw new BadRequestException(`Refund amount cannot exceed approved amount (${approvedAmount})`);
    //         }

    //         // Check if refund already exists for this claim
    //         const existingRefund = await this.refundsModel.findOne({ claimId });
    //         if (existingRefund) {
    //             throw new BadRequestException('Refund already exists for this expense claim');
    //         }

    //         // Create refund record
    //         const refund = new this.refundsModel({
    //             claimId,
    //             refundDetails: {
    //                 description: generateRefundDTO.description || `Refund for expense claim ${claim.claimId}`,
    //                 amount: generateRefundDTO.refundAmount,
    //             },
    //             employeeId: claim.employeeId,
    //             financeStaffId: currentUser.sub,
    //             status: RefundStatus.PENDING, // Will be marked PAID when payroll runs
    //         });

    //         return await refund.save();
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to generate refund for expense claim: ${error.message}`);
    //     }
    // }

    // /**
    //  * Get all pending refunds (Finance Staff)
    //  * Business Rule: Finance staff can view pending refunds for processing
    //  * @param currentUser - JWT payload of finance staff
    //  */
    // async getPendingRefunds(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: refunds[], total: number }> {
    //     try {
    //         // Verify user is Finance Staff
    //         if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
    //             throw new ForbiddenException('Only Finance Staff can view pending refunds');
    //         }

    //         const [data, total] = await Promise.all([
    //             this.refundsModel
    //                 .find({ status: RefundStatus.PENDING })
    //                 .skip(skip)
    //                 .limit(limit)
    //                 .sort({ createdAt: -1 })
    //                 .exec(),
    //             this.refundsModel.countDocuments({ status: RefundStatus.PENDING }),
    //         ]);

    //         return { data, total };
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to retrieve pending refunds: ${error.message}`);
    //     }
    // }

    // /**
    //  * Get all paid refunds (Finance Staff)
    //  * Business Rule: Finance staff can view paid refunds (included in payroll cycles)
    //  * @param currentUser - JWT payload of finance staff
    //  */
    // async getPaidRefunds(currentUser: JwtPayload, skip: number = 0, limit: number = 10): Promise<{ data: refunds[], total: number }> {
    //     try {
    //         // Verify user is Finance Staff
    //         if (!currentUser.roles?.includes(SystemRole.FINANCE_STAFF)) {
    //             throw new ForbiddenException('Only Finance Staff can view paid refunds');
    //         }

    //         const [data, total] = await Promise.all([
    //             this.refundsModel
    //                 .find({ status: RefundStatus.PAID })
    //                 .skip(skip)
    //                 .limit(limit)
    //                 .sort({ updatedAt: -1 })
    //                 .exec(),
    //             this.refundsModel.countDocuments({ status: RefundStatus.PAID }),
    //         ]);

    //         return { data, total };
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to retrieve paid refunds: ${error.message}`);
    //     }
    // }

    // /**
    //  * Get refund by ID (Finance Staff)
    //  * @param refundId - MongoDB ObjectId of the refund
    //  * @param currentUser - JWT payload of the requesting user
    //  */
    // async getRefundById(refundId: string, currentUser: JwtPayload): Promise<refunds> {
    //     try {
    //         const refund = await this.refundsModel.findById(refundId);
    //         if (!refund) {
    //             throw new NotFoundException(`Refund with ID ${refundId} not found`);
    //         }

    //         // TODO: Implement access control - user should be Finance Staff or related to the refund
    //         return refund;
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to retrieve refund: ${error.message}`);
    //     }
    // }

    // // ============ HELPER METHODS ============

    // /**
    //  * Helper: Generate sequential ID
    //  * @param modelName - Name of the model to generate ID for
    //  * @param prefix - Prefix for the ID (e.g., 'DISP', 'CLAIM')
    //  */
    // private async generateSequentialId(prefix: string, model: Model<any>): Promise<string> {
    //     const count = await model.countDocuments();
    //     return `${prefix}-${String(count + 1).padStart(4, '0')}`;
    // }
}
