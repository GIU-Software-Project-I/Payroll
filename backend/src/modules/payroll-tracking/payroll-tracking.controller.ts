import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';

// Auth decorators and guards (lightweight stubs for this module)
import { CurrentUser } from './shared/current-user.decorator';
import { AuthenticationGuard } from './shared/authentication.guard';
import { AuthorizationGuard } from './shared/authorization.guard';
import { Roles } from './shared/roles.decorator';

// JWT Payload
import type { JwtPayload } from './shared/jwt-payload.interface';

// DTOs
import { CreateDisputeDTO } from './dto/create-dispute.dto';
import { CreateClaimDTO } from './dto/create-claim.dto';
import { ApproveRejectDisputeDTO } from './dto/approve-reject-dispute.dto';
import { ApproveRejectClaimDTO } from './dto/approve-reject-claim.dto';
import { PayrollReportFilterDTO } from './dto/payroll-report-filter.dto';
import { MonthEndYearEndReportFilterDTO } from './dto/month-end-year-end-report.dto';

// Enums
import { SystemRole } from './shared/system-role.enum';

@Controller('payroll-tracking')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class PayrollTrackingController {
    constructor(private readonly payrollTrackingService: PayrollTrackingService) { }

    // ============ DISPUTES ENDPOINTS ============

    /**
     * POST /payroll-tracking/disputes
     * Employee: Create a new dispute
     * Business Rule: Employee can raise disputes against their payslip
     */
    @Post('disputes')
    @HttpCode(HttpStatus.CREATED)
    async createDispute(
        @Body() createDisputeDTO: CreateDisputeDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.createDispute(createDisputeDTO, currentUser);
    }

    /**
     * GET /payroll-tracking/disputes/specialist/pending
     * Payroll Specialist: Get all pending disputes for approval
     * Business Rule: Only pending disputes are shown to Payroll Specialist
     */
    @Get('disputes/specialist/pending')
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    async getDisputesForSpecialist(
        @CurrentUser() currentUser: JwtPayload,
        @Query('skip') skip: string = '0',
        @Query('limit') limit: string = '10'
    ) {
        return this.payrollTrackingService.getDisputesForPayrollSpecialist(
            currentUser,
            parseInt(skip),
            parseInt(limit)
        );
    }

    /**
     * GET /payroll-tracking/disputes/finance/approved
     * Finance Staff: Get all approved disputes
     * Business Rule: Finance staff can view only approved disputes for adjustments
     */
    @Get('disputes/finance/approved')
    @Roles(SystemRole.FINANCE_STAFF)
    async getApprovedDisputesForFinance(
        @CurrentUser() currentUser: JwtPayload,
        @Query('skip') skip: string = '0',
        @Query('limit') limit: string = '10'
    ) {
        return this.payrollTrackingService.getApprovedDisputesForFinanceStaff(
            currentUser,
            parseInt(skip),
            parseInt(limit)
        );
    }

    /**
     * GET /payroll-tracking/disputes/:id
     * Get dispute by ID
     */
    @Get('disputes/:id')
    async getDisputeById(
        @Param('id') id: string,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.getDisputeById(id, currentUser);
    }

    /**
     * PUT /payroll-tracking/disputes/:id/specialist
     * Payroll Specialist: Approve or Reject a dispute
     * Business Rule: Specialist's approval/rejection will escalate to Payroll Manager
     */
    @Put('disputes/:id/specialist')
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    async approveRejectDisputeBySpecialist(
        @Param('id') id: string,
        @Body() approveRejectDTO: ApproveRejectDisputeDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.approveRejectDisputeBySpecialist(id, approveRejectDTO, currentUser);
    }

    /**
     * PUT /payroll-tracking/disputes/:id/manager
     * Payroll Manager: Confirm approval of disputes (Multi-step approval)
     * Business Rule: Only approved disputes reach manager for final decision
     */
    @Put('disputes/:id/manager')
    // TODO: Uncomment after adding PAYROLL_MANAGER to SystemRole enum
    // @Roles(SystemRole.PAYROLL_MANAGER)
    async confirmDisputeApprovalByManager(
        @Param('id') id: string,
        @Body() approveRejectDTO: ApproveRejectDisputeDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.confirmDisputeApprovalByManager(id, approveRejectDTO, currentUser);
    }

    // ============ EXPENSE CLAIMS ENDPOINTS ============

    /**
     * POST /payroll-tracking/expense-claims
     * Employee: Create a new expense claim
     * Business Rule: Employee can submit expense claims
     */
    @Post('expense-claims')
    @HttpCode(HttpStatus.CREATED)
    async createExpenseClaim(
        @Body() createClaimDTO: CreateClaimDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.createExpenseClaim(createClaimDTO, currentUser);
    }

    /**
     * GET /payroll-tracking/expense-claims/specialist/pending
     * Payroll Specialist: Get all pending expense claims for approval
     * Business Rule: Only pending claims are shown to Payroll Specialist
     */
    @Get('expense-claims/specialist/pending')
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    async getExpenseClaimsForSpecialist(
        @CurrentUser() currentUser: JwtPayload,
        @Query('skip') skip: string = '0',
        @Query('limit') limit: string = '10'
    ) {
        return this.payrollTrackingService.getExpenseClaimsForPayrollSpecialist(
            currentUser,
            parseInt(skip),
            parseInt(limit)
        );
    }

    /**
     * GET /payroll-tracking/expense-claims/finance/approved
     * Finance Staff: Get all approved expense claims
     * Business Rule: Finance staff can view only approved claims for processing
     */
    @Get('expense-claims/finance/approved')
    @Roles(SystemRole.FINANCE_STAFF)
    async getApprovedExpenseClaimsForFinance(
        @CurrentUser() currentUser: JwtPayload,
        @Query('skip') skip: string = '0',
        @Query('limit') limit: string = '10'
    ) {
        return this.payrollTrackingService.getApprovedExpenseClaimsForFinanceStaff(
            currentUser,
            parseInt(skip),
            parseInt(limit)
        );
    }

    /**
     * GET /payroll-tracking/expense-claims/:id
     * Get expense claim by ID
     */
    @Get('expense-claims/:id')
    async getExpenseClaimById(
        @Param('id') id: string,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.getExpenseClaimById(id, currentUser);
    }

    /**
     * PUT /payroll-tracking/expense-claims/:id/specialist
     * Payroll Specialist: Approve or Reject an expense claim
     * Business Rule: Specialist's approval/rejection will escalate to Payroll Manager
     */
    @Put('expense-claims/:id/specialist')
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    async approveRejectExpenseClaimBySpecialist(
        @Param('id') id: string,
        @Body() approveRejectDTO: ApproveRejectClaimDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.approveRejectExpenseClaimBySpecialist(id, approveRejectDTO, currentUser);
    }

    /**
     * PUT /payroll-tracking/expense-claims/:id/manager
     * Payroll Manager: Confirm approval of expense claims (Multi-step approval)
     * Business Rule: Only approved claims reach manager for final decision
     */
    @Put('expense-claims/:id/manager')
    // TODO: Uncomment after adding PAYROLL_MANAGER to SystemRole enum
    // @Roles(SystemRole.PAYROLL_MANAGER)
    async confirmExpenseClaimApprovalByManager(
        @Param('id') id: string,
        @Body() approveRejectDTO: ApproveRejectClaimDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.confirmExpenseClaimApprovalByManager(id, approveRejectDTO, currentUser);
    }

    // ============ PAYROLL REPORTS ENDPOINTS ============

    /**
     * POST /payroll-tracking/reports/payroll-by-department
     * Payroll Specialist: Generate payroll report by department
     * Business Rule: Payroll Specialist can generate payroll reports filtered by department
     * Report includes: salary distribution, deductions, net pay by department
     */
    @Post('reports/payroll-by-department')
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    async generatePayrollReportByDepartment(
        @Body() filterDTO: PayrollReportFilterDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.generatePayrollReportByDepartment(filterDTO, currentUser);
    }

    /**
     * POST /payroll-tracking/reports/month-end-year-end
     * Finance Staff: Generate month-end and year-end payroll summaries
     * Business Rule: Finance staff generates comprehensive payroll summaries
     * Report includes: total payroll expenses, tax reports, insurance contributions, benefits
     */
    @Post('reports/month-end-year-end')
    @Roles(SystemRole.FINANCE_STAFF)
    async generateMonthEndYearEndSummary(
        @Body() filterDTO: MonthEndYearEndReportFilterDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.generateMonthEndYearEndSummary(filterDTO, currentUser);
    }

    /**
     * POST /payroll-tracking/reports/tax-insurance-benefits
     * Finance Staff: Generate tax, insurance, and benefits report
     * Business Rule: Finance staff generates detailed reports on taxes, insurance contributions, and benefits
     * Report includes: tax breakdown by employee, insurance contributions, benefits paid
     */
    @Post('reports/tax-insurance-benefits')
    @Roles(SystemRole.FINANCE_STAFF)
    async generateTaxInsuranceBenefitsReport(
        @Body() filterDTO: MonthEndYearEndReportFilterDTO,
        @CurrentUser() currentUser: JwtPayload
    ) {
        return this.payrollTrackingService.generateTaxInsuranceBenefitsReport(filterDTO, currentUser);
    }

    // // ============ REFUND PROCESS ENDPOINTS ============

    // /**
    //  * POST /payroll-tracking/refunds/dispute
    //  * Finance Staff: Generate refund for approved dispute
    //  * Business Rule: Finance staff generates refund for approved disputes
    //  * The refund will be included in the next payroll cycle
    //  */
    // @Post('refunds/dispute')
    // @HttpCode(HttpStatus.CREATED)
    // @Roles(SystemRole.FINANCE_STAFF)
    // async generateRefundForDispute(
    //     @Body() generateRefundDTO: GenerateRefundForDisputeDTO,
    //     @CurrentUser() currentUser: JwtPayload
    // ) {
    //     return this.payrollTrackingService.generateRefundForDispute(
    //         generateRefundDTO.disputeId,
    //         generateRefundDTO,
    //         currentUser
    //     );
    // }

    // /**
    //  * POST /payroll-tracking/refunds/expense-claim
    //  * Finance Staff: Generate refund for approved expense claim
    //  * Business Rule: Finance staff generates refund for approved expense claims
    //  * The refund will be included in the next payroll cycle
    //  */
    // @Post('refunds/expense-claim')
    // @HttpCode(HttpStatus.CREATED)
    // @Roles(SystemRole.FINANCE_STAFF)
    // async generateRefundForExpenseClaim(
    //     @Body() generateRefundDTO: GenerateRefundForExpenseClaimDTO,
    //     @CurrentUser() currentUser: JwtPayload
    // ) {
    //     return this.payrollTrackingService.generateRefundForExpenseClaim(
    //         generateRefundDTO.claimId,
    //         generateRefundDTO,
    //         currentUser
    //     );
    // }

    // /**
    //  * GET /payroll-tracking/refunds/pending
    //  * Finance Staff: Get all pending refunds
    //  * Business Rule: Finance staff can view pending refunds for processing
    //  */
    // @Get('refunds/pending')
    // @Roles(SystemRole.FINANCE_STAFF)
    // async getPendingRefunds(
    //     @CurrentUser() currentUser: JwtPayload,
    //     @Query('skip') skip: string = '0',
    //     @Query('limit') limit: string = '10'
    // ) {
    //     return this.payrollTrackingService.getPendingRefunds(
    //         currentUser,
    //         parseInt(skip),
    //         parseInt(limit)
    //     );
    // }

    // /**
    //  * GET /payroll-tracking/refunds/paid
    //  * Finance Staff: Get all paid refunds
    //  * Business Rule: Finance staff can view paid refunds (included in payroll cycles)
    //  */
    // @Get('refunds/paid')
    // @Roles(SystemRole.FINANCE_STAFF)
    // async getPaidRefunds(
    //     @CurrentUser() currentUser: JwtPayload,
    //     @Query('skip') skip: string = '0',
    //     @Query('limit') limit: string = '10'
    // ) {
    //     return this.payrollTrackingService.getPaidRefunds(
    //         currentUser,
    //         parseInt(skip),
    //         parseInt(limit)
    //     );
    // }

    // /**
    //  * GET /payroll-tracking/refunds/:id
    //  * Get refund by ID
    //  */
    // @Get('refunds/:id')
    // @Roles(SystemRole.FINANCE_STAFF)
    // async getRefundById(
    //     @Param('id') id: string,
    //     @CurrentUser() currentUser: JwtPayload
    // ) {
    //     return this.payrollTrackingService.getRefundById(id, currentUser);
    // }
}
