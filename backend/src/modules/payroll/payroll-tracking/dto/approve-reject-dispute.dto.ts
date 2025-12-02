import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { DisputeStatus } from '../enums/payroll-tracking-enum';

export class ApproveRejectDisputeDTO {
  @IsEnum(DisputeStatus)
  status!: DisputeStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  resolutionComment?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmount?: number;

  @IsString()
  @IsOptional()
  refundDescription?: string;
}


