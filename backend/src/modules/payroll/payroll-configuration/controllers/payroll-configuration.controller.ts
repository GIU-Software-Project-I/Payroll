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
  BadRequestException,
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
import { CreatePayrollPolicyDto } from '../dto/create-payrollpolicy.dto';
import { QueryPayrollPolicyDto } from '../dto/query-payroll-policy.dto';
import { ApprovePayrollPolicyDto } from '../dto/approve-payroll-policy.dto';
import { CreatePayTypeDto } from '../dto/create-paytype.dto';
import { QueryPayTypeDto } from '../dto/query-pay-type.dto';
import { ApprovePayTypeDto } from '../dto/approve-pay-type.dto';
import { CreateAllowanceDto } from '../dto/create-allowance.dto';
import { QueryAllowanceDto } from '../dto/query-allowance.dto';
import { ApproveAllowanceDto } from '../dto/approve-allowance.dto';
import { CreateSigningBonusDto } from '../dto/create-signingbonus.dto';
import { QuerySigningBonusDto } from '../dto/query-signing-bonus.dto';
import { ApproveSigningBonusDto } from '../dto/approve-signing-bonus.dto';
import { CreateTerminationBenefitDto } from '../dto/create-terminationbenefit.dto';
import { QueryTerminationBenefitDto } from '../dto/query-termination-benefit.dto';
import { ApproveTerminationBenefitDto } from '../dto/approve-termination-benefit.dto';
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

  @Post('allowances')
  @HttpCode(HttpStatus.CREATED)
  async createAllowance(@Body() createDto: CreateAllowanceDto) {
    const allowance = await this.payrollConfigurationService.createAllowance(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Allowance created successfully as DRAFT',
      data: allowance,
    };
  }
  
  @Get('allowances/all')
  @HttpCode(HttpStatus.OK)
  async findAllAllowances(@Query() queryDto: QueryAllowanceDto) {
    const result = await this.payrollConfigurationService.findAllAllowances(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Allowances retrieved successfully',
      ...result,
    };
  }
  
  @Get('allowances/:id')
  @HttpCode(HttpStatus.OK)
  async findOneAllowance(@Param('id') id: string) {
    const allowance = await this.payrollConfigurationService.findOneAllowance(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Allowance retrieved successfully',
      data: allowance,
    };
  }
  
  @Patch('allowances/:id')
  @HttpCode(HttpStatus.OK)
  async updateAllowance(
    @Param('id') id: string,
    @Body() updateDto: UpdateAllowanceDto,
  ) {
    const allowance = await this.payrollConfigurationService.updateAllowance(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Allowance updated successfully',
      data: allowance,
    };
  }
  
  @Delete('allowances/:id')
  @HttpCode(HttpStatus.OK)
  async removeAllowance(@Param('id') id: string) {
    const result = await this.payrollConfigurationService.removeAllowance(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
  
  @Patch('allowances/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveAllowance(
    @Param('id') id: string,
    @Body() approveDto: ApproveAllowanceDto,
  ) {
    const allowance = await this.payrollConfigurationService.approveAllowance(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Allowance approved successfully',
      data: allowance,
    };
  }
  
  @Patch('allowances/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectAllowance(
    @Param('id') id: string,
    @Body() approveDto: ApproveAllowanceDto,
  ) {
    const allowance = await this.payrollConfigurationService.rejectAllowance(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Allowance rejected successfully',
      data: allowance,
    };
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


















  // ==================== PAY TYPE ENDPOINTS ====================
  @Post('pay-types')
  @HttpCode(HttpStatus.CREATED)
  async createPayType(@Body() createDto: CreatePayTypeDto) {
    const payType = await this.payrollConfigurationService.createPayType(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Pay type created successfully as DRAFT',
      data: payType,
    };
  }
  @Get('pay-types/all')
  @HttpCode(HttpStatus.OK)
  async findAllPayTypes(@Query() queryDto: QueryPayTypeDto) {
    const result = await this.payrollConfigurationService.findAllPayTypes(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay types retrieved successfully',
      ...result,
    };
  }

  @Get('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async findOnePayType(@Param('id') id: string) {
    const payType = await this.payrollConfigurationService.findOnePayType(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type retrieved successfully',
      data: payType,
    };
  }

  @Patch('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async updatePayType(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayTypeDto,
  ) {
    const payType = await this.payrollConfigurationService.updatePayType(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type updated successfully',
      data: payType,
    };
  }

  @Delete('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async removePayType(@Param('id') id: string) {
    const result = await this.payrollConfigurationService.removePayType(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Patch('pay-types/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayType(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayTypeDto,
  ) {
    const payType = await this.payrollConfigurationService.approvePayType(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type approved successfully',
      data: payType,
    };
  }

  @Patch('pay-types/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayType(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayTypeDto,
  ) {
    const payType = await this.payrollConfigurationService.rejectPayType(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type rejected successfully',
      data: payType,
    };
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayrollPolicy(@Body() createDto: CreatePayrollPolicyDto) {
    const policy = await this.payrollConfigurationService.createPayrollPolicy(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payroll policy created successfully as DRAFT',
      data: policy,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllPayrollPolicy(@Query() queryDto: QueryPayrollPolicyDto) {
    const result = await this.payrollConfigurationService.findAllPayrollPolicy(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policies retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOnePayrollPolicy(@Param('id') id: string) {
    const policy = await this.payrollConfigurationService.findOnePayrollPolicy(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy retrieved successfully',
      data: policy,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePayrollPolicy(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigurationService.updatePayrollPolicy(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy updated successfully',
      data: policy,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removePayrollPolicy(@Param('id') id: string) {
    const result = await this.payrollConfigurationService.removePayrollPolicy(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigurationService.approvePayrollPolicy(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy approved successfully',
      data: policy,
    };
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigurationService.rejectPayrollPolicy(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy rejected successfully',
      data: policy,
    };
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











  // ==================== SIGNING BONUS ENDPOINTS ====================
@Post('signing-bonuses')
@HttpCode(HttpStatus.CREATED)
async createSigningBonus(@Body() createDto: CreateSigningBonusDto) {
  const signingBonus = await this.payrollConfigurationService.createSigningBonus(createDto);
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Signing bonus created successfully as DRAFT',
    data: signingBonus,
  };
}

@Get('signing-bonuses/all')
@HttpCode(HttpStatus.OK)
async findAllSigningBonuses(@Query() queryDto: QuerySigningBonusDto) {
  const result = await this.payrollConfigurationService.findAllSigningBonuses(queryDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonuses retrieved successfully',
    ...result,
  };
}

@Get('signing-bonuses/:id')
@HttpCode(HttpStatus.OK)
async findOneSigningBonus(@Param('id') id: string) {
  const signingBonus = await this.payrollConfigurationService.findOneSigningBonus(id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus retrieved successfully',
    data: signingBonus,
  };
}

@Patch('signing-bonuses/:id')
@HttpCode(HttpStatus.OK)
async updateSigningBonus(
  @Param('id') id: string,
  @Body() updateDto: UpdateSigningBonusDto,
) {
  const signingBonus = await this.payrollConfigurationService.updateSigningBonus(id, updateDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus updated successfully',
    data: signingBonus,
  };
}

@Delete('signing-bonuses/:id')
@HttpCode(HttpStatus.OK)
async removeSigningBonus(@Param('id') id: string) {
  const result = await this.payrollConfigurationService.removeSigningBonus(id);
  return {
    statusCode: HttpStatus.OK,
    ...result,
  };
}

@Patch('signing-bonuses/:id/approve')
@HttpCode(HttpStatus.OK)
async approveSigningBonus(
  @Param('id') id: string,
  @Body() approveDto: ApproveSigningBonusDto,
) {
  const signingBonus = await this.payrollConfigurationService.approveSigningBonus(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus approved successfully',
    data: signingBonus,
  };
}

@Patch('signing-bonuses/:id/reject')
@HttpCode(HttpStatus.OK)
async rejectSigningBonus(
  @Param('id') id: string,
  @Body() approveDto: ApproveSigningBonusDto,
) {
  const signingBonus = await this.payrollConfigurationService.rejectSigningBonus(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus rejected successfully',
    data: signingBonus,
  };
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










  // ==================== TERMINATION BENEFITS ENDPOINTS ====================
@Post('termination-benefits')
@HttpCode(HttpStatus.CREATED)
async createTerminationBenefit(@Body() createDto: CreateTerminationBenefitDto) {
  const benefit = await this.payrollConfigurationService.createTerminationBenefit(createDto);
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Termination benefit created successfully as DRAFT',
    data: benefit,
  };
}

@Get('termination-benefits/all')
@HttpCode(HttpStatus.OK)
async findAllTerminationBenefits(@Query() queryDto: QueryTerminationBenefitDto) {
  const result = await this.payrollConfigurationService.findAllTerminationBenefits(queryDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefits retrieved successfully',
    ...result,
  };
}

@Get('termination-benefits/:id')
@HttpCode(HttpStatus.OK)
async findOneTerminationBenefit(@Param('id') id: string) {
  const benefit = await this.payrollConfigurationService.findOneTerminationBenefit(id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefit retrieved successfully',
    data: benefit,
  };
}

@Patch('termination-benefits/:id')
@HttpCode(HttpStatus.OK)
async updateTerminationBenefit(
  @Param('id') id: string,
  @Body() updateDto: UpdateTerminationBenefitDto,
) {
  const benefit = await this.payrollConfigurationService.updateTerminationBenefit(id, updateDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefit updated successfully',
    data: benefit,
  };
}

@Delete('termination-benefits/:id')
@HttpCode(HttpStatus.OK)
async removeTerminationBenefit(@Param('id') id: string) {
  const result = await this.payrollConfigurationService.removeTerminationBenefit(id);
  return {
    statusCode: HttpStatus.OK,
    ...result,
  };
}

@Patch('termination-benefits/:id/approve')
@HttpCode(HttpStatus.OK)
async approveTerminationBenefit(
  @Param('id') id: string,
  @Body() approveDto: ApproveTerminationBenefitDto,
) {
  const benefit = await this.payrollConfigurationService.approveTerminationBenefit(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefit approved successfully',
    data: benefit,
  };
}

@Patch('termination-benefits/:id/reject')
@HttpCode(HttpStatus.OK)
async rejectTerminationBenefit(
  @Param('id') id: string,
  @Body() approveDto: ApproveTerminationBenefitDto,
) {
  const benefit = await this.payrollConfigurationService.rejectTerminationBenefit(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefit rejected successfully',
    data: benefit,
  };
}
@Post('termination-benefits/calculate')
@HttpCode(HttpStatus.OK)
async calculateTerminationEntitlements(
  @Body() employeeData: any, // Using any for simplicity - could create a DTO if needed
) {
  const result = await this.payrollConfigurationService.calculateTerminationEntitlements(employeeData);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination entitlements calculated successfully',
    data: result,
  };
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
