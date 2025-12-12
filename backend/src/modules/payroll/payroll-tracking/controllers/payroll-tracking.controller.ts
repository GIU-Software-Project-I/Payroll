import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PayrollTrackingService } from '../services/payroll-tracking.service';
import {
  CreateClaimDto,
  CreateDisputeDto,
  CreateRefundDto,
  UpdateClaimDto,
  UpdateDisputeDto,
  UpdateRefundDto,
  PaginationDto,
} from '../dtos';

@Controller('payroll/tracking')
export class PayrollTrackingController {
  constructor(private readonly payrollTrackingService: PayrollTrackingService) {}

  // @Get('employee/:employeeId/payslips')
  // async getEmployeePayslips(
  //   @Param('employeeId') employeeId: string,
  //   @Query() paginationDto: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getEmployeePayslips(employeeId, paginationDto);
  // }

  @Get('payslip/:payslipId/employee/:employeeId')
  async getPayslipDetails(
    @Param('payslipId') payslipId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollTrackingService.getPayslipDetails(payslipId, employeeId);
  }

  @Get('payslip/:payslipId/employee/:employeeId/download')
  async downloadPayslip(
    @Param('payslipId') payslipId: string,
    @Param('employeeId') employeeId: string,
    @Res() res: Response,
  ) {
    const payslip = await this.payrollTrackingService.downloadPayslip(payslipId, employeeId);

    const fileName = `payslip-${payslip.employeeId}-${payslip.payslipId}.csv`;

    const headers = [
      'payslipId',
      'employeeId',
      'payrollRunId',
      'totalGrossSalary',
      'totalDeductions',
      'netPay',
      'paymentStatus',
      'createdAt',
      'updatedAt',
    ];

    const values = [
      payslip.payslipId,
      payslip.employeeId,
      payslip.payrollRunId,
      payslip.totalGrossSalary,
      payslip.totalDeductions,
      payslip.netPay,
      payslip.paymentStatus,
      payslip.createdAt,
      payslip.updatedAt,
    ];

    const csvContent = `${headers.join(',')}` + '\n' + `${values.join(',')}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }

  @Get('employee/:employeeId/base-salary')
  async getBaseSalary(@Param('employeeId') employeeId: string) {
    return this.payrollTrackingService.getBaseSalary(employeeId);
  }

  @Get('employee/:employeeId/leave-compensation')
  async getLeaveCompensation(@Param('employeeId') employeeId: string) {
    return this.payrollTrackingService.getLeaveCompensation(employeeId);
  }

  @Get('employee/:employeeId/transportation')
  async getTransportationCompensation(@Param('employeeId') employeeId: string) {
    return this.payrollTrackingService.getTransportationCompensation(employeeId);
  }

  @Get('employee/:employeeId/tax-deductions')
  async getTaxDeductions(
    @Param('employeeId') employeeId: string,
    @Query('payslipId') payslipId?: string,
  ) {
    return this.payrollTrackingService.getTaxDeductions(employeeId, payslipId);
  }

  @Get('employee/:employeeId/insurance-deductions')
  async getInsuranceDeductions(
    @Param('employeeId') employeeId: string,
    @Query('payslipId') payslipId?: string,
  ) {
    return this.payrollTrackingService.getInsuranceDeductions(employeeId, payslipId);
  }

  @Get('employee/:employeeId/misconduct-deductions')
  async getMisconductDeductions(
    @Param('employeeId') employeeId: string,
    @Query('payslipId') payslipId?: string,
  ) {
    return this.payrollTrackingService.getMisconductDeductions(employeeId, payslipId);
  }

  @Get('employee/:employeeId/unpaid-leave-deductions')
  async getUnpaidLeaveDeductions(
    @Param('employeeId') employeeId: string,
    @Query('payslipId') payslipId?: string,
  ) {
    return this.payrollTrackingService.getUnpaidLeaveDeductions(employeeId, payslipId);
  }

  // @Get('employee/:employeeId/salary-history')
  // async getSalaryHistory(
  //   @Param('employeeId') employeeId: string,
  //   @Query() paginationDto: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getSalaryHistory(employeeId, paginationDto);
  // }

  @Get('employee/:employeeId/employer-contributions')
  async getEmployerContributions(
    @Param('employeeId') employeeId: string,
    @Query('payslipId') payslipId?: string,
  ) {
    return this.payrollTrackingService.getEmployerContributions(employeeId, payslipId);
  }

  @Get('employee/:employeeId/tax-documents')
  async getTaxDocuments(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.payrollTrackingService.getTaxDocuments(employeeId, year);
  }

  @Get('employee/:employeeId/tax-documents/:year/download')
  async downloadAnnualTaxStatement(
    @Param('employeeId') employeeId: string,
    @Param('year') year: string,
    @Res() res: Response,
  ) {
    const taxData = await this.payrollTrackingService.downloadAnnualTaxStatement(
      employeeId,
      Number(year),
    );

    const fileName = `tax-statement-${employeeId}-${taxData.taxYear}.csv`;

    const headers = [
      'taxYear',
      'employeeId',
      'totalTaxableIncome',
      'totalTaxPaid',
      'effectiveRatePct',
      'payslipsCount',
    ];

    const summaryRow = [
      taxData.taxYear,
      taxData.employeeId,
      taxData.totalTaxableIncome,
      taxData.totalTaxPaid,
      taxData.effectiveRatePct,
      taxData.payslipsCount,
    ];

    const detailHeaders = [
      'payslipId',
      'payrollRunId',
      'periodDate',
      'taxableBase',
      'totalTaxForSlip',
    ];

    const detailRows = taxData.payslips.map((p) => [
      p.payslipId,
      p.payrollRunId,
      p.periodDate,
      p.taxableBase,
      p.totalTaxForSlip,
    ]);

    const csvLines = [
      headers.join(','),
      summaryRow.join(','),
      '',
      detailHeaders.join(','),
      ...detailRows.map((r) => r.join(',')),
    ];

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }

  @Post('employee/:employeeId/disputes')
  @HttpCode(HttpStatus.CREATED)
  async createDispute(
    @Param('employeeId') employeeId: string,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    return this.payrollTrackingService.createDispute(employeeId, createDisputeDto);
  }

  @Post('employee/:employeeId/claims')
  @HttpCode(HttpStatus.CREATED)
  async createClaim(
    @Param('employeeId') employeeId: string,
    @Body() createClaimDto: CreateClaimDto,
  ) {
    return this.payrollTrackingService.createClaim(employeeId, createClaimDto);
  }

  @Get('employee/:employeeId/track-requests')
  async trackClaimsAndDisputes(@Param('employeeId') employeeId: string) {
    return this.payrollTrackingService.trackClaimsAndDisputes(employeeId);
  }

  @Get('reports/department-payroll')
  async generateDepartmentPayrollReport(
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.payrollTrackingService.generateDepartmentPayrollReport(departmentId, start, end);
  }

  @Get('reports/payroll-summary')
  async generatePayrollSummary(
    @Query('type') type: 'monthly' | 'yearly',
    @Query('period') period?: string,
  ) {
    return this.payrollTrackingService.generatePayrollSummary(type, period);
  }

  @Get('reports/compliance')
  async generateComplianceReport(
    @Query('type') type: string,
    @Query('year') year?: number,
  ) {
    return this.payrollTrackingService.generateComplianceReport(type, year);
  }

  @Put('disputes/:disputeId/review')
  async reviewDispute(
    @Param('disputeId') disputeId: string,
    @Query('specialistId') specialistId: string,
    @Query('action') action: 'approve' | 'reject',
    @Body() body: { reason?: string },
  ) {
    return this.payrollTrackingService.reviewDispute(disputeId, specialistId, action, body.reason);
  }

  @Put('disputes/:disputeId/confirm')
  async confirmDisputeApproval(
    @Param('disputeId') disputeId: string,
    @Query('managerId') managerId: string,
    @Query('action') action: 'confirm' | 'reject',
    @Body() body: { reason?: string },
  ) {
    return this.payrollTrackingService.confirmDisputeApproval(disputeId, managerId, action, body.reason);
  }

  // @Get('disputes/approved')
  // async getApprovedDisputes(
  //   @Query('financeStaffId') financeStaffId?: string,
  //   @Query() paginationDto?: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getApprovedDisputes(financeStaffId, paginationDto);
  // }

  @Put('claims/:claimId/review')
  async reviewClaim(
    @Param('claimId') claimId: string,
    @Query('specialistId') specialistId: string,
    @Query('action') action: 'approve' | 'reject',
    @Body() body: { approvedAmount?: number; reason?: string },
  ) {
    return this.payrollTrackingService.reviewClaim(
      claimId,
      specialistId,
      action,
      body.approvedAmount,
      body.reason,
    );
  }

  @Put('claims/:claimId/confirm')
  async confirmClaimApproval(
    @Param('claimId') claimId: string,
    @Query('managerId') managerId: string,
    @Query('action') action: 'confirm' | 'reject',
    @Body() body: { reason?: string },
  ) {
    return this.payrollTrackingService.confirmClaimApproval(claimId, managerId, action, body.reason);
  }

  // @Get('claims/approved')
  // async getApprovedClaims(
  //   @Query('financeStaffId') financeStaffId?: string,
  //   @Query() paginationDto?: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getApprovedClaims(financeStaffId, paginationDto);
  // }

  @Post('refunds/dispute/:disputeId')
  @HttpCode(HttpStatus.CREATED)
  async generateDisputeRefund(
    @Param('disputeId') disputeId: string,
    @Query('financeStaffId') financeStaffId: string,
    @Body() createRefundDto: CreateRefundDto,
  ) {
    return this.payrollTrackingService.generateDisputeRefund(
      disputeId,
      financeStaffId,
      createRefundDto.amount,
      createRefundDto.description,
    );
  }

  @Post('refunds/claim/:claimId')
  @HttpCode(HttpStatus.CREATED)
  async generateClaimRefund(
    @Param('claimId') claimId: string,
    @Query('financeStaffId') financeStaffId: string,
    @Body() createRefundDto: CreateRefundDto,
  ) {
    return this.payrollTrackingService.generateClaimRefund(
      claimId,
      financeStaffId,
      createRefundDto.amount,
      createRefundDto.description,
    );
  }

  // @Get('refunds/pending')
  // async getPendingRefunds(@Query() paginationDto?: PaginationDto) {
  //   return this.payrollTrackingService.getPendingRefunds(paginationDto);
  // }

  @Put('refunds/:refundId/mark-paid')
  async markRefundAsPaid(
    @Param('refundId') refundId: string,
    @Body() body: { payrollRunId: string },
  ) {
    return this.payrollTrackingService.markRefundAsPaid(refundId, body.payrollRunId);
  }

  // @Get('claims')
  // async getAllClaims(
  //   @Query('status') status?: string,
  //   @Query('employeeId') employeeId?: string,
  //   @Query() paginationDto?: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getAllClaims(status, employeeId, paginationDto);
  // }

  @Get('claims/:id')
  async getClaimById(@Param('id') id: string) {
    return this.payrollTrackingService.getClaimById(id);
  }

  @Put('claims/:id')
  async updateClaim(@Param('id') id: string, @Body() updateClaimDto: UpdateClaimDto) {
    return this.payrollTrackingService.updateClaimById(id, updateClaimDto);
  }

  @Delete('claims/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClaim(@Param('id') id: string) {
    await this.payrollTrackingService.deleteClaimById(id);
  }

  // @Get('disputes')
  // async getAllDisputes(
  //   @Query('status') status?: string,
  //   @Query('employeeId') employeeId?: string,
  //   @Query() paginationDto?: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getAllDisputes(status, employeeId, paginationDto);
  // }

  @Get('disputes/:id')
  async getDisputeById(@Param('id') id: string) {
    return this.payrollTrackingService.getDisputeById(id);
  }

  @Put('disputes/:id')
  async updateDispute(@Param('id') id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.payrollTrackingService.updateDisputeById(id, updateDisputeDto);
  }

  @Delete('disputes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDispute(@Param('id') id: string) {
    await this.payrollTrackingService.deleteDisputeById(id);
  }

  // @Get('refunds')
  // async getAllRefunds(
  //   @Query('status') status?: string,
  //   @Query('employeeId') employeeId?: string,
  //   @Query() paginationDto?: PaginationDto,
  // ) {
  //   return this.payrollTrackingService.getAllRefunds(status, employeeId, paginationDto);
  // }

  @Get('refunds/:id')
  async getRefundById(@Param('id') id: string) {
    return this.payrollTrackingService.getRefundById(id);
  }

  @Put('refunds/:id')
  async updateRefund(@Param('id') id: string, @Body() updateRefundDto: UpdateRefundDto) {
    return this.payrollTrackingService.updateRefundById(id, updateRefundDto);
  }

  @Delete('refunds/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRefund(@Param('id') id: string) {
    await this.payrollTrackingService.deleteRefundById(id);
  }
}