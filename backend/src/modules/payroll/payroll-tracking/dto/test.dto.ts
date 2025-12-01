import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimStatus, DisputeStatus, RefundStatus } from '../enums/payroll-tracking-enum';

// Employee-facing DTOs

export class CreateDisputeDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsMongoId()
  payslipId: string;
}

export class CreateClaimDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  claimType: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}

export class PayslipQueryDto {
  @IsOptional()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  toDate?: Date;
}

export class TaxDocumentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
}

// Internal / staff-facing DTOs

export class DecideDisputeDto {
  @IsNotEmpty()
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;

  // Optional refund metadata to be created on approval
  @IsOptional()
  @IsString()
  refundDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  refundAmount?: number;
}

export class DecideClaimDto {
  @IsNotEmpty()
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;

  @IsOptional()
  @IsString()
  refundDescription?: string;
}

export class UpdateRefundStatusDto {
  @IsNotEmpty()
  @IsEnum(RefundStatus)
  status: RefundStatus;

  @IsOptional()
  @IsMongoId()
  paidInPayrollRunId?: string;
}

