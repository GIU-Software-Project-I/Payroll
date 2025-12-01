import { Controller, Post, Get, Patch, Param, Body, Delete, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { PayrollConfigurationService } from '../services/payroll-configuration.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTaxRuleDto } from '../dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from '../dto/update-tax-rule.dto';
import { ApproveTaxRuleDto } from '../dto/approve-tax-rule.dto';
import { CreateInsuranceDto } from '../dto/create-insurance.dto';
import { UpdateInsuranceDto } from '../dto/update-insurance.dto';
import { ApproveInsuranceDto } from '../dto/approve-insurance.dto';

@Controller('payroll-configuration')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PayrollConfigurationController {
  constructor(private readonly payrollConfigService: PayrollConfigurationService) {}

  // ===== TAX RULES =====
  @Post('tax-rules')
  @HttpCode(HttpStatus.CREATED)
  createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.payrollConfigService.createTaxRule(dto);
  }

  @Get('tax-rules')
  @HttpCode(HttpStatus.OK)
  getTaxRules() {
    return this.payrollConfigService.getTaxRules();
  }

  @Get('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  getTaxRuleById(@Param('id') id: string) {
    return this.payrollConfigService.getTaxRuleById(id);
  }

  @Patch('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  updateLegalRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.payrollConfigService.updateLegalRule(id, dto);
  }

  @Patch('tax-rules/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveTaxRule(@Param('id') id: string, @Body() dto: ApproveTaxRuleDto) {
    return this.payrollConfigService.approveTaxRule(id, dto);
  }

  @Delete('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  deleteTaxRule(@Param('id') id: string) {
    return this.payrollConfigService.deleteTaxRule(id);
  }

  // ===== INSURANCE BRACKETS =====
  @Post('insurance-brackets')
  @HttpCode(HttpStatus.CREATED)
  createInsurance(@Body() dto: CreateInsuranceDto) {
    return this.payrollConfigService.createInsuranceBracket(dto);
  }

  @Get('insurance-brackets')
  @HttpCode(HttpStatus.OK)
  getInsuranceBrackets() {
    return this.payrollConfigService.getInsuranceBrackets();
  }

  @Get('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  getInsuranceBracketById(@Param('id') id: string) {
    return this.payrollConfigService.getInsuranceBracketById(id);
  }

  @Patch('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    return this.payrollConfigService.updateInsuranceBracket(id, dto);
  }

  @Patch('insurance-brackets/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveInsurance(@Param('id') id: string, @Body() dto: ApproveInsuranceDto) {
    return this.payrollConfigService.approveInsuranceBracket(id, dto);
  }

  @Delete('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  deleteInsurance(@Param('id') id: string) {
    return this.payrollConfigService.deleteInsuranceBracket(id);
  }

  @Patch('tax-rules/:id/reject')
@HttpCode(HttpStatus.OK)
rejectTaxRule(@Param('id') id: string, @Body() dto: ApproveTaxRuleDto) {
  return this.payrollConfigService.rejectTaxRule(id, dto);
}

// ===== INSURANCE BRACKETS =====

@Patch('insurance-brackets/:id/reject')
@HttpCode(HttpStatus.OK)
rejectInsurance(@Param('id') id: string, @Body() dto: ApproveInsuranceDto) {
  return this.payrollConfigService.rejectInsuranceBracket(id, dto);
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
    return this.payrollConfigService.getInsuranceBracketById(id).then((bracket) => {
      const result = this.payrollConfigService.calculateContributions(bracket, numericSalary);
      if (!result) {
        throw new BadRequestException('Salary does not fall within this insurance bracket');
      }
      return result;
    });
  }
}
