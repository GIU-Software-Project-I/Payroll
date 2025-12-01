

// ========== End of Lama's Work ==========

// ========== Mano's Work ==========
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollConfigurationService } from '../services/payroll-configuration.service';
import { UpdateCompanyWideSettingsDto } from '../dto/update-company-settings.dto';
import { ApproveConfigDto } from '../dto/approve-config.dto';
import { UpdateAllowanceDto } from '../dto/update-allowance.dto';
import { UpdatePayTypeDto } from '../dto/update-paytype.dto';
import { CreatePayGradeDto } from '../dto/create-paygrade.dto';
import { UpdatePayGradeDto } from '../dto/update-paygrade.dto';
import { UpdateTaxRuleDto } from '../dto/update-taxrule.dto';
import { UpdatePayrollPolicyDto } from '../dto/update-payrollpolicy.dto';
import { UpdateSigningBonusDto } from '../dto/update-signingbonus.dto';
import { UpdateTerminationBenefitDto } from '../dto/update-terminationbenefit.dto';

import { BadRequestException } from '@nestjs/common';
import { CreateTaxRuleDto } from '../dto/create-tax-rule.dto';

import { ApproveTaxRuleDto } from '../dto/approve-tax-rule.dto';
import { CreateInsuranceDto } from '../dto/create-insurance.dto';
import { UpdateInsuranceDto } from '../dto/update-insurance.dto';
import { ApproveInsuranceDto } from '../dto/approve-insurance.dto';

@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigurationService: PayrollConfigurationService,
  ) {}
  
  // ===== TAX RULES =====
  @Post('tax-rules')
  @HttpCode(HttpStatus.CREATED)
  createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.payrollConfigurationService.createTaxRule(dto);
  }

  @Get('tax-rules')
  @HttpCode(HttpStatus.OK)
  getTaxRules() {
    return this.payrollConfigurationService.getTaxRules();
  }

  @Get('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  getTaxRuleById(@Param('id') id: string) {
    return this.payrollConfigurationService.getTaxRuleById(id);
  }

  @Patch('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  updateLegalRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.payrollConfigurationService.updateLegalRule(id, dto);
  }



  // ===== INSURANCE BRACKETS =====
  @Post('insurance-brackets')
  @HttpCode(HttpStatus.CREATED)
  createInsurance(@Body() dto: CreateInsuranceDto) {
    return this.payrollConfigurationService.createInsuranceBracket(dto);
  }

  @Get('insurance-brackets')
  @HttpCode(HttpStatus.OK)
  getInsuranceBrackets() {
    return this.payrollConfigurationService.getInsuranceBrackets();
  }

  @Get('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  getInsuranceBracketById(@Param('id') id: string) {
    return this.payrollConfigurationService.getInsuranceBracketById(id);
  }

  @Patch('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    return this.payrollConfigurationService.updateInsuranceBracket(id, dto);
  }

  @Patch('insurance-brackets/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveInsurance(@Param('id') id: string, @Body() dto: ApproveInsuranceDto) {
    return this.payrollConfigurationService.approveInsuranceBracket(id, dto);
  }

  @Delete('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  deleteInsurance(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteInsuranceBracket(id);
  }


// ===== INSURANCE BRACKETS =====

@Patch('insurance-brackets/:id/reject')
@HttpCode(HttpStatus.OK)
rejectInsurance(@Param('id') id: string, @Body() dto: ApproveInsuranceDto) {
  return this.payrollConfigurationService.rejectInsuranceBracket(id, dto);
}

  // ===== CONTRIBUTION CALCULATION =====
  /**
   * Calculate employee and employer contributions for a given insurance bracket and salary.
   * Query parameters:
   *   - salary: number
   */
  @Get('insurance-brackets/:id/calculate-contributions')
  @HttpCode(HttpStatus.OK)
  calculateContributions(
    @Param('id') id: string,
    @Query('salary') salary: string,
  ) {
    const numericSalary = Number(salary);
    if (isNaN(numericSalary) || numericSalary < 0) {
      throw new BadRequestException('Salary must be a positive number');
    }
    return this.payrollConfigurationService.getInsuranceBracketById(id).then((bracket) => {
      const result = this.payrollConfigurationService.calculateContributions(bracket, numericSalary);
      if (!result) {
        throw new BadRequestException('Salary does not fall within this insurance bracket');
      }
      return result;
    });
  }

  // ==================== ALLOWANCE ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update allowance configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('allowances/:id')
  updateAllowance(
    @Param('id') id: string,
    @Body() updateDto: UpdateAllowanceDto,
  ) {
    return this.payrollConfigurationService.updateAllowance(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete allowance configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('allowances/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllowance(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteAllowance(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('allowances/:id/approve')
  approveAllowance(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approveAllowance(id, approveDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('allowances/:id/reject')
  rejectAllowance(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectAllowance(id, approveDto);
  }

  // ==================== PAY TYPE ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update pay type configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('pay-types/:id')
  updatePayType(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayTypeDto,
  ) {
    return this.payrollConfigurationService.updatePayType(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete pay type configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('pay-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePayType(@Param('id') id: string) {
    return this.payrollConfigurationService.deletePayType(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('pay-types/:id/approve')
  approvePayType(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayType(id, approveDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('pay-types/:id/reject')
  rejectPayType(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayType(id, approveDto);
  }

  // ==================== PAY GRADE ENDPOINTS ====================

  /**
   * PHASE 2 - REQ-PY-2: Create pay grade (create draft)
   * As a Payroll Specialist, I want to define pay grades, salary ranges, and compensation limits
   * All configuration items must be created with status = Draft
   * Business Rules:
   * - BR10: The system allows multiple pay scales by grade, department, or location
   * - BR31: Gross Salary = Base Pay + Allowances
   */
  @Post('pay-grades')
  createPayGrade(@Body() createDto: CreatePayGradeDto) {
    return this.payrollConfigurationService.createPayGrade(createDto);
  }

  /**
   * PHASE 2 - REQ-PY-2: View all pay grades
   * As a Payroll Specialist, I want to view all pay grades
   * @param status - Optional query parameter to filter by status (draft, approved, rejected)
   */
  @Get('pay-grades')
  findAllPayGrades(@Query('status') status?: string) {
    return this.payrollConfigurationService.findAllPayGrades(
      status as any,
    );
  }

  /**
   * PHASE 2 - REQ-PY-2: Update pay grade configuration (edit draft)
   * PHASE 4 - REQ-PY-18: Also allows editing REJECTED configurations
   * Phase 2 Requirement: Editing is allowed ONLY while status is Draft
   * Phase 4 Requirement: Cannot edit approved configurations - must delete and create new one
   */
  @Put('pay-grades/:id')
  updatePayGrade(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayGradeDto,
  ) {
    return this.payrollConfigurationService.updatePayGrade(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete pay grade configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('pay-grades/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePayGrade(@Param('id') id: string) {
    return this.payrollConfigurationService.deletePayGrade(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('pay-grades/:id/approve')
  approvePayGrade(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayGrade(id, approveDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('pay-grades/:id/reject')
  rejectPayGrade(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayGrade(id, approveDto);
  }

  // ==================== TAX RULES ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update tax rule configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('tax-rules/:id')
  updateTaxRule(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaxRuleDto,
  ) {
    return this.payrollConfigurationService.updateTaxRule(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete tax rule configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('tax-rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTaxRule(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteTaxRule(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('tax-rules/:id/approve')
  approveTaxRule(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approveTaxRule(id, approveDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('tax-rules/:id/reject')
  rejectTaxRule(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectTaxRule(id, approveDto);
  }

  // ==================== INSURANCE BRACKETS ENDPOINTS ====================

  /**
   * PHASE 5 - REQ-PY-22: HR Approval of Insurance Brackets
   * HR Manager review, approve insurance brackets (special case - not Payroll Manager)
   */
  @Patch('insurance-brackets/:id/approve')
  approveInsuranceBracket(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approveInsuranceBracket(
      id,
      approveDto,
    );
  }

  /**
   * PHASE 5 - REQ-PY-22: HR Approval of Insurance Brackets
   * HR Manager reject insurance brackets
   */
  @Patch('insurance-brackets/:id/reject')
  rejectInsuranceBracket(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectInsuranceBracket(
      id,
      approveDto,
    );
  }

  // ==================== PAYROLL POLICIES ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update payroll policy configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('policies/:id')
  updatePayrollPolicy(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayrollPolicyDto,
  ) {
    return this.payrollConfigurationService.updatePayrollPolicy(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete payroll policy configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePayrollPolicy(@Param('id') id: string) {
    return this.payrollConfigurationService.deletePayrollPolicy(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('policies/:id/approve')
  approvePayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayrollPolicy(
      id,
      approveDto,
    );
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('policies/:id/reject')
  rejectPayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayrollPolicy(id, approveDto);
  }

  // ==================== SIGNING BONUS ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update signing bonus configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('signing-bonuses/:id')
  updateSigningBonus(
    @Param('id') id: string,
    @Body() updateDto: UpdateSigningBonusDto,
  ) {
    return this.payrollConfigurationService.updateSigningBonus(id, updateDto);
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete signing bonus configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('signing-bonuses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSigningBonus(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteSigningBonus(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('signing-bonuses/:id/approve')
  approveSigningBonus(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approveSigningBonus(
      id,
      approveDto,
    );
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('signing-bonuses/:id/reject')
  rejectSigningBonus(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectSigningBonus(id, approveDto);
  }

  // ==================== TERMINATION BENEFITS ENDPOINTS ====================

  /**
   * PHASE 4 - REQ-PY-18: Update termination benefit configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  @Put('termination-benefits/:id')
  updateTerminationBenefit(
    @Param('id') id: string,
    @Body() updateDto: UpdateTerminationBenefitDto,
  ) {
    return this.payrollConfigurationService.updateTerminationBenefit(
      id,
      updateDto,
    );
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete termination benefit configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  @Delete('termination-benefits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTerminationBenefit(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteTerminationBenefit(id);
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  @Patch('termination-benefits/:id/approve')
  approveTerminationBenefit(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approveTerminationBenefit(
      id,
      approveDto,
    );
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  @Patch('termination-benefits/:id/reject')
  rejectTerminationBenefit(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.rejectTerminationBenefit(
      id,
      approveDto,
    );
  }

  // ==================== COMPANY WIDE SETTINGS ENDPOINTS ====================
  /**
   * PHASE 3 - REQ-PY-15: Company-Wide Payroll Settings
   * Get company-wide settings (pay dates, time zone, currency)
   */
  @Get('company-settings')
  getCompanyWideSettings() {
    return this.payrollConfigurationService.getCompanyWideSettings();
  }

  /**
   * PHASE 3 - REQ-PY-15: Company-Wide Payroll Settings
   * Update company-wide settings (pay dates, time zone, currency)
   */
  @Put('company-settings')
  updateCompanyWideSettings(@Body() updateDto: UpdateCompanyWideSettingsDto) {
    return this.payrollConfigurationService.updateCompanyWideSettings(
      updateDto,
    );
  }

  // ==================== BACKUP ENDPOINTS ====================
  /**
   * PHASE 3 - REQ-PY-16: System Backup Configuration
   * Create backup of payroll configuration & tables
   * @param body - Backup options (name, oplog, dumpDbUsersAndRoles)
   */
  @Post('backup/create')
  @HttpCode(HttpStatus.CREATED)
  createBackup(
    @Body() body?: { name?: string; oplog?: boolean; dumpDbUsersAndRoles?: boolean },
  ) {
    return this.payrollConfigurationService.createBackup({
      name: body?.name || 'payroll-config-backup',
      oplog: body?.oplog ?? false,
      dumpDbUsersAndRoles: body?.dumpDbUsersAndRoles ?? false,
    });
  }

  /**
   * PHASE 3 - REQ-PY-16: System Backup Configuration
   * List all backups
   */
  @Get('backup/list')
  listBackups() {
    return this.payrollConfigurationService.listBackups();
  }

  /**
   * PHASE 3 - REQ-PY-16: System Backup Configuration
   * Delete a backup
   * @param filename - Backup filename to delete
   */
  @Delete('backup/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBackup(@Param('filename') filename: string) {
    return this.payrollConfigurationService.deleteBackup(filename);
  }

}
