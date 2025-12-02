import { IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ClaimStatus } from '../enums/payroll-tracking-enum';

export class ApproveRejectClaimDTO {
  @IsEnum(ClaimStatus)
  status!: ClaimStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  approvedAmount?: number;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  resolutionComment?: string;

  @IsString()
  @IsOptional()
  refundDescription?: string;
}


