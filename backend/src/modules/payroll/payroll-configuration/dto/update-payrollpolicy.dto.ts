import { IsString, IsNumber, Min, Max, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PolicyType, Applicability } from '../enums/payroll-configuration-enums';

export class RuleDefinitionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsNumber()
  @Min(0)
  fixedAmount: number;

  @IsNumber()
  @Min(1)
  thresholdAmount: number;
}

export class UpdatePayrollPolicyDto {
  @IsString()
  @IsOptional()
  policyName?: string;

  @IsEnum(PolicyType)
  @IsOptional()
  policyType?: PolicyType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: Date;

  @IsOptional()
  ruleDefinition?: RuleDefinitionDto;

  @IsEnum(Applicability)
  @IsOptional()
  applicability?: Applicability;
}

