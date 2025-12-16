import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from '../services/finance.service';
import { GenerateReportDto } from '../dto/generate-report.dto';

@ApiTags('Finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ============ TAX REPORTS ============

  @Get('tax-reports')
  @ApiOperation({ summary: 'Get tax reports' })
  @ApiResponse({ status: 200, description: 'List of tax reports' })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (YYYY-MM)' })
  async getTaxReports(@Query('period') period?: string) {
    const reports = await this.financeService.getTaxReports(period);
    return reports;
  }

  @Post('tax-reports/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate tax report' })
  @ApiResponse({ status: 200, description: 'Tax report generated' })
  async generateTaxReport(@Body() generateReportDto: GenerateReportDto) {
    const report = await this.financeService.generateTaxReport(generateReportDto.period);
    return report;
  }

  @Get('tax-reports/:id/download')
  @ApiOperation({ summary: 'Download tax report' })
  @ApiResponse({ status: 200, description: 'Tax report downloaded' })
  async downloadTaxReport(@Param('id') id: string) {
    return await this.financeService.downloadTaxReport(id);
  }

  // ============ INSURANCE REPORTS ============

  @Get('insurance-reports')
  @ApiOperation({ summary: 'Get insurance reports' })
  @ApiResponse({ status: 200, description: 'List of insurance reports' })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (YYYY-MM)' })
  async getInsuranceReports(@Query('period') period?: string) {
    const reports = await this.financeService.getInsuranceReports(period);
    return reports;
  }

  @Post('insurance-reports/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate insurance report' })
  @ApiResponse({ status: 200, description: 'Insurance report generated' })
  async generateInsuranceReport(@Body() generateReportDto: GenerateReportDto) {
    const report = await this.financeService.generateInsuranceReport(generateReportDto.period);
    return report;
  }

  @Get('insurance-reports/:id/download')
  @ApiOperation({ summary: 'Download insurance report' })
  @ApiResponse({ status: 200, description: 'Insurance report downloaded' })
  async downloadInsuranceReport(@Param('id') id: string) {
    return await this.financeService.downloadInsuranceReport(id);
  }

  // ============ BENEFITS REPORTS ============

  @Get('benefits-reports')
  @ApiOperation({ summary: 'Get benefits reports' })
  @ApiResponse({ status: 200, description: 'List of benefits reports' })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (YYYY-MM)' })
  async getBenefitsReports(@Query('period') period?: string) {
    const reports = await this.financeService.getBenefitsReports(period);
    return reports;
  }

  @Post('benefits-reports/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate benefits report' })
  @ApiResponse({ status: 200, description: 'Benefits report generated' })
  async generateBenefitsReport(@Body() generateReportDto: GenerateReportDto) {
    const report = await this.financeService.generateBenefitsReport(generateReportDto.period);
    return report;
  }

  @Get('benefits-reports/:id/download')
  @ApiOperation({ summary: 'Download benefits report' })
  @ApiResponse({ status: 200, description: 'Benefits report downloaded' })
  async downloadBenefitsReport(@Param('id') id: string) {
    return await this.financeService.downloadBenefitsReport(id);
  }

  // ============ PAYROLL SUMMARIES ============

  @Get('payroll-summaries')
  @ApiOperation({ summary: 'Get payroll summaries' })
  @ApiResponse({ status: 200, description: 'List of payroll summaries' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (month_end/year_end)' })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (YYYY-MM)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department' })
  async getPayrollSummaries(@Query() filters: any) {
    const summaries = await this.financeService.getPayrollSummaries(filters);
    return summaries;
  }

  @Post('payroll-summaries/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate payroll summary' })
  @ApiResponse({ status: 200, description: 'Payroll summary generated' })
  async generatePayrollSummary(@Body() generateReportDto: GenerateReportDto) {
    const summary = await this.financeService.generatePayrollSummary(generateReportDto.type || 'month_end', generateReportDto.period);
    return summary;
  }

  @Get('payroll-summaries/:id/download')
  @ApiOperation({ summary: 'Download payroll summary' })
  @ApiResponse({ status: 200, description: 'Payroll summary downloaded' })
  async downloadPayrollSummary(@Param('id') id: string) {
    return await this.financeService.downloadPayrollSummary(id);
  }

  // ============ PAYSLIP HISTORY ============

  @Get('payslip-history')
  @ApiOperation({ summary: 'Get payslip history reports' })
  @ApiResponse({ status: 200, description: 'List of payslip history reports' })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (YYYY-MM)' })
  async getPayslipHistory(@Query('period') period?: string) {
    const reports = await this.financeService.getPayslipHistory(period);
    return reports;
  }

  @Post('payslip-history/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate payslip history report' })
  @ApiResponse({ status: 200, description: 'Payslip history report generated' })
  async generatePayslipHistoryReport(@Body() generateReportDto: GenerateReportDto) {
    const report = await this.financeService.generatePayslipHistoryReport(generateReportDto.period);
    return report;
  }

  @Get('payslip-history/:id/download')
  @ApiOperation({ summary: 'Download payslip history report' })
  @ApiResponse({ status: 200, description: 'Payslip history report downloaded' })
  async downloadPayslipHistoryReport(@Param('id') id: string) {
    return await this.financeService.downloadPayslipHistoryReport(id);
  }
}
