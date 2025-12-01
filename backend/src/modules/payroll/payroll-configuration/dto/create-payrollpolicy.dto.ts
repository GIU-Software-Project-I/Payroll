import { IsString, IsNumber, Min, Max, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
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

export class CreatePayrollPolicyDto {
  @IsString()
  @IsNotEmpty()
  policyName: string;

  @IsEnum(PolicyType)
  policyType: PolicyType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  effectiveDate: Date;

  @IsNotEmpty()
  ruleDefinition: RuleDefinitionDto;

  @IsEnum(Applicability)
  applicability: Applicability;

  @IsString()
  @IsNotEmpty()
  createdByEmployeeId: string;
}

