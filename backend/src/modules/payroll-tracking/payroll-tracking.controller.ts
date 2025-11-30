import { Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';

@Controller('finance')
export class PayrollTrackingController {
  constructor(private readonly payrollTrackingService: PayrollTrackingService) {}

  // ---------------- A. VIEW APPROVED ITEMS ---------------------

  @Get('disputes/approved')
  getApprovedDisputes() {
    return this.payrollTrackingService.getApprovedDisputes();
  }

  @Get('claims/approved')
  getApprovedClaims() {
    return this.payrollTrackingService.getApprovedClaims();
  }

  // ---------------- B. REFUND GENERATION ------------------------

  @Post('refund/dispute/:id')
  generateRefundForDispute(@Param('id') id: string) {
    return this.payrollTrackingService.generateRefundForDispute(id);
  }

  @Post('refund/claim/:id')
  generateRefundForClaim(@Param('id') id: string) {
    return this.payrollTrackingService.generateRefundForClaim(id);
  }

  @Get('refunds')
  getPendingRefunds() {
    return this.payrollTrackingService.getPendingRefunds();
  }

  @Get('refunds/:id')
  getRefundDetails(@Param('id') id: string) {
    return this.payrollTrackingService.getRefundDetails(id);
  }

  // ---------------- C. MARK REFUND AS PAID ----------------------

  @Patch('refunds/:id/execute')
  executeRefund(@Param('id') id: string) {
    return this.payrollTrackingService.executeRefund(id);
  }

  // ---------------- D. FINANCE REPORTS --------------------------

  @Get('reports/month-end')
  getMonthEndReport() {
    return this.payrollTrackingService.getMonthEndReport();
  }

  @Get('reports/year-end')
  getYearEndReport() {
    return this.payrollTrackingService.getYearEndReport();
  }

  @Get('reports/tax')
  getTaxReport() {
    return this.payrollTrackingService.getTaxReport();
  }
}
