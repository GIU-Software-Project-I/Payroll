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

@Controller('payroll-configuration')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

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
}