import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { CreatePayrollPolicyDto } from './dto/create-payroll-policy.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
import { QueryPayrollPolicyDto } from './dto/query-payroll-policy.dto';
import { ApprovePayrollPolicyDto } from './dto/approve-payroll-policy.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';
import { QueryPayTypeDto } from './dto/query-pay-type.dto';
import { ApprovePayTypeDto } from './dto/approve-pay-type.dto';
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';
import { QueryAllowanceDto } from './dto/query-allowance.dto';
import { ApproveAllowanceDto } from './dto/approve-allowance.dto';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';
import { QuerySigningBonusDto } from './dto/query-signing-bonus.dto';
import { ApproveSigningBonusDto } from './dto/approve-signing-bonus.dto';
import { CreateTerminationBenefitDto } from './dto/create-termination-benefit.dto';
import { UpdateTerminationBenefitDto } from './dto/update-termination-benefit.dto';
import { QueryTerminationBenefitDto } from './dto/query-termination-benefit.dto';
import { ApproveTerminationBenefitDto } from './dto/approve-termination-benefit.dto';

@Controller('payroll-configuration')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

  // ========== PAYROLL POLICIES ENDPOINTS (ORIGINAL - UNCHANGED) ==========
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePayrollPolicyDto) {
    const policy = await this.payrollConfigService.create(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payroll policy created successfully as DRAFT',
      data: policy,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() queryDto: QueryPayrollPolicyDto) {
    const result = await this.payrollConfigService.findAll(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policies retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const policy = await this.payrollConfigService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy retrieved successfully',
      data: policy,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigService.update(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy updated successfully',
      data: policy,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.payrollConfigService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigService.approve(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy approved successfully',
      data: policy,
    };
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollPolicyDto,
  ) {
    const policy = await this.payrollConfigService.reject(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll policy rejected successfully',
      data: policy,
    };
  }

  // ========== PAY TYPES ENDPOINTS (ADDED WITH EXPLICIT PATHS) ==========
  @Post('pay-types')
  @HttpCode(HttpStatus.CREATED)
  async createPayType(@Body() createDto: CreatePayTypeDto) {
    const payType = await this.payrollConfigService.createPayType(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Pay type created successfully as DRAFT',
      data: payType,
    };
  }

  @Get('pay-types/all')
  @HttpCode(HttpStatus.OK)
  async findAllPayTypes(@Query() queryDto: QueryPayTypeDto) {
    const result = await this.payrollConfigService.findAllPayTypes(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay types retrieved successfully',
      ...result,
    };
  }

  @Get('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async findOnePayType(@Param('id') id: string) {
    const payType = await this.payrollConfigService.findOnePayType(id);
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
    const payType = await this.payrollConfigService.updatePayType(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type updated successfully',
      data: payType,
    };
  }

  @Delete('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async removePayType(@Param('id') id: string) {
    const result = await this.payrollConfigService.removePayType(id);
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
    const payType = await this.payrollConfigService.approvePayType(id, approveDto.approvedBy);
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
    const payType = await this.payrollConfigService.rejectPayType(id, approveDto.approvedBy);
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay type rejected successfully',
      data: payType,
    };
  }
  // ========== ALLOWANCE ENDPOINTS ==========
@Post('allowances')
@HttpCode(HttpStatus.CREATED)
async createAllowance(@Body() createDto: CreateAllowanceDto) {
  const allowance = await this.payrollConfigService.createAllowance(createDto);
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Allowance created successfully as DRAFT',
    data: allowance,
  };
}

@Get('allowances/all')
@HttpCode(HttpStatus.OK)
async findAllAllowances(@Query() queryDto: QueryAllowanceDto) {
  const result = await this.payrollConfigService.findAllAllowances(queryDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Allowances retrieved successfully',
    ...result,
  };
}

@Get('allowances/:id')
@HttpCode(HttpStatus.OK)
async findOneAllowance(@Param('id') id: string) {
  const allowance = await this.payrollConfigService.findOneAllowance(id);
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
  const allowance = await this.payrollConfigService.updateAllowance(id, updateDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Allowance updated successfully',
    data: allowance,
  };
}

@Delete('allowances/:id')
@HttpCode(HttpStatus.OK)
async removeAllowance(@Param('id') id: string) {
  const result = await this.payrollConfigService.removeAllowance(id);
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
  const allowance = await this.payrollConfigService.approveAllowance(id, approveDto.approvedBy);
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
  const allowance = await this.payrollConfigService.rejectAllowance(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Allowance rejected successfully',
    data: allowance,
  };
}
// ========== SIGNING BONUS ENDPOINTS ==========
@Post('signing-bonuses')
@HttpCode(HttpStatus.CREATED)
async createSigningBonus(@Body() createDto: CreateSigningBonusDto) {
  const signingBonus = await this.payrollConfigService.createSigningBonus(createDto);
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Signing bonus created successfully as DRAFT',
    data: signingBonus,
  };
}

@Get('signing-bonuses/all')
@HttpCode(HttpStatus.OK)
async findAllSigningBonuses(@Query() queryDto: QuerySigningBonusDto) {
  const result = await this.payrollConfigService.findAllSigningBonuses(queryDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonuses retrieved successfully',
    ...result,
  };
}

@Get('signing-bonuses/:id')
@HttpCode(HttpStatus.OK)
async findOneSigningBonus(@Param('id') id: string) {
  const signingBonus = await this.payrollConfigService.findOneSigningBonus(id);
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
  const signingBonus = await this.payrollConfigService.updateSigningBonus(id, updateDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus updated successfully',
    data: signingBonus,
  };
}

@Delete('signing-bonuses/:id')
@HttpCode(HttpStatus.OK)
async removeSigningBonus(@Param('id') id: string) {
  const result = await this.payrollConfigService.removeSigningBonus(id);
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
  const signingBonus = await this.payrollConfigService.approveSigningBonus(id, approveDto.approvedBy);
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
  const signingBonus = await this.payrollConfigService.rejectSigningBonus(id, approveDto.approvedBy);
  return {
    statusCode: HttpStatus.OK,
    message: 'Signing bonus rejected successfully',
    data: signingBonus,
  };
}
// ========== TERMINATION & RESIGNATION BENEFITS ENDPOINTS ==========
@Post('termination-benefits')
@HttpCode(HttpStatus.CREATED)
async createTerminationBenefit(@Body() createDto: CreateTerminationBenefitDto) {
  const benefit = await this.payrollConfigService.createTerminationBenefit(createDto);
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Termination benefit created successfully as DRAFT',
    data: benefit,
  };
}

@Get('termination-benefits/all')
@HttpCode(HttpStatus.OK)
async findAllTerminationBenefits(@Query() queryDto: QueryTerminationBenefitDto) {
  const result = await this.payrollConfigService.findAllTerminationBenefits(queryDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefits retrieved successfully',
    ...result,
  };
}

@Get('termination-benefits/:id')
@HttpCode(HttpStatus.OK)
async findOneTerminationBenefit(@Param('id') id: string) {
  const benefit = await this.payrollConfigService.findOneTerminationBenefit(id);
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
  const benefit = await this.payrollConfigService.updateTerminationBenefit(id, updateDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination benefit updated successfully',
    data: benefit,
  };
}

@Delete('termination-benefits/:id')
@HttpCode(HttpStatus.OK)
async removeTerminationBenefit(@Param('id') id: string) {
  const result = await this.payrollConfigService.removeTerminationBenefit(id);
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
  const benefit = await this.payrollConfigService.approveTerminationBenefit(id, approveDto.approvedBy);
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
  const benefit = await this.payrollConfigService.rejectTerminationBenefit(id, approveDto.approvedBy);
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
  const result = await this.payrollConfigService.calculateTerminationEntitlements(employeeData);
  return {
    statusCode: HttpStatus.OK,
    message: 'Termination entitlements calculated successfully',
    data: result,
  };
}
}