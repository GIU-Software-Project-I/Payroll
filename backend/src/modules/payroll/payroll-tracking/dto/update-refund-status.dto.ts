import { IsEnum, IsString, IsOptional } from 'class-validator';
import { RefundStatus } from '../enums/payroll-tracking-enum';

export class UpdateRefundStatusDto {
  @IsEnum(RefundStatus)
  status!: RefundStatus;

  @IsString()
  @IsOptional()
  paidInPayrollRunId?: string;
}

