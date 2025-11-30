import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Patch,
} from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ActionDto } from './dto/action.dto';

@Controller('payroll')
export class PayrollTrackingController {
  constructor(private readonly svc: PayrollTrackingService) {}

  // Payslips
  @Get('payslips')
  async listPayslips(@Query('employeeId') employeeId: string) {
    if (!employeeId) throw new NotFoundException('employeeId query param required');
    return this.svc.getPayslipsByEmployee(employeeId);
  }

  @Get('payslips/:id')
  async getPayslip(@Param('id') id: string) {
    return this.svc.getPayslipById(id);
  }

  @Get('payslips/:id/download')
  async downloadPayslip(@Param('id') id: string) {
    const url = await this.svc.getPayslipDownloadUrl(id);
    return { url };
  }

  // Claims
  @Post('claims')
  async createClaim(@Body() dto: CreateClaimDto) {
    return this.svc.createClaim(dto);
  }

  @Get('claims')
  async listClaims(@Query('employeeId') employeeId: string) {
    if (!employeeId) return [];
    return this.svc.getClaimsByEmployee(employeeId);
  }

  @Get('claims/:id')
  async getClaim(@Param('id') id: string) {
    return this.svc.getClaimById(id);
  }

  // Disputes
  @Post('disputes')
  async createDispute(@Body() dto: CreateDisputeDto) {
    return this.svc.createDispute(dto);
  }

  @Get('disputes')
  async listDisputes(@Query('employeeId') employeeId: string) {
    if (!employeeId) return [];
    return this.svc.getDisputesByEmployee(employeeId);
  }

  // --- Reports ---
  @Get('reports/payroll/department')
  async reportPayrollByDepartment() {
    return this.svc.reportPayrollByDepartment();
  }

  @Get('reports/payroll/month-end')
  async reportPayrollMonthEnd(@Query('month') month: string, @Query('year') year: string) {
    const m = parseInt(month || String(new Date().getMonth() + 1), 10);
    const y = parseInt(year || String(new Date().getFullYear()), 10);
    return this.svc.reportMonthEnd(m, y);
  }

  @Get('reports/payroll/year-end')
  async reportPayrollYearEnd(@Query('year') year: string) {
    const y = parseInt(year || String(new Date().getFullYear()), 10);
    return this.svc.reportYearEnd(y);
  }

  @Get('reports/tax-insurance-benefits')
  async reportTaxInsuranceBenefits() {
    return this.svc.reportTaxInsuranceBenefits();
  }

  // --- Disputes (specialist) ---
  @Get('disputes/pending')
  async disputesPending() {
    return this.svc.getDisputesPendingForSpecialist();
  }

  @Get('disputes/manager/pending')
  async disputesManagerPending() {
    return this.svc.getDisputesPendingForManager();
  }

  @Patch('disputes/:id/approve')
  async approveDispute(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.specialistApproveDispute(id, dto.actorId, dto.comment);
  }

  @Patch('disputes/:id/reject')
  async rejectDispute(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.specialistRejectDispute(id, dto.actorId, dto.comment);
  }

  @Patch('disputes/:id/confirm')
  async confirmDispute(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.managerConfirmDispute(id, dto.actorId, dto.amountAdjusted, dto.comment);
  }

  @Patch('disputes/:id/deny')
  async denyDispute(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.managerDenyDispute(id, dto.actorId, dto.comment);
  }

  // --- Claims (specialist) ---
  @Get('claims/pending')
  async claimsPending() {
    return this.svc.getClaimsPendingForSpecialist();
  }

  @Get('claims/manager/pending')
  async claimsManagerPending() {
    return this.svc.getClaimsPendingForManager();
  }

  @Patch('claims/:id/approve')
  async approveClaim(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.specialistApproveClaim(id, dto.actorId, dto.comment);
  }

  @Patch('claims/:id/reject')
  async rejectClaim(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.specialistRejectClaim(id, dto.actorId, dto.comment);
  }

  @Patch('claims/:id/confirm')
  async confirmClaim(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.managerConfirmClaim(id, dto.actorId, dto.comment);
  }

  @Patch('claims/:id/deny')
  async denyClaim(@Param('id') id: string, @Body() dto: ActionDto) {
    return this.svc.managerDenyClaim(id, dto.actorId, dto.comment);
  }

  // --- Notification trigger ---
  @Post('internal/notify/finance')
  async notifyFinance() {
    return this.svc.notifyFinance();
  }

  @Get('disputes/:id')
  async getDispute(@Param('id') id: string) {
    return this.svc.getDisputeById(id);
  }

  // Tax documents
  @Get('tax-docs')
  async getTaxDocs(@Query('employeeId') employeeId: string, @Query('year') year: string) {
    const y = parseInt(year || new Date().getFullYear().toString(), 10);
    return { url: await this.svc.getTaxDocumentUrl(employeeId, y) };
  }

  // Employee base salary/profile
  @Get('profile/:employeeId')
  async getProfile(@Param('employeeId') employeeId: string) {
    return this.svc.getEmployeeBaseSalary(employeeId);
  }

  // Salary history (alias)
  @Get('salary-history')
  async salaryHistory(@Query('employeeId') employeeId: string) {
    if (!employeeId) return [];
    return this.svc.getPayslipsByEmployee(employeeId);
  }
}
