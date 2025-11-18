// backend/src/dto/payroll-process/pre.run.adjustment.dto.ts

// @ts-ignore
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PreRunAdjustmentType {
  SIGNING_BONUS = 'SIGNING_BONUS',
  RESIGNATION_BENEFIT = 'RESIGNATION_BENEFIT',
  TERMINATION_BENEFIT = 'TERMINATION_BENEFIT',
}

export enum PreRunAdjustmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreatePreRunAdjustmentDto {
  @IsEnum(PreRunAdjustmentType)
  type: PreRunAdjustmentType;

  @IsMongoId()
  employeeId: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ApprovePreRunAdjustmentDto {
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsMongoId()
  actorId?: string;
}

export class RejectPreRunAdjustmentDto {
  @IsMongoId()
  id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsMongoId()
  actorId?: string;
}


export class UpdatePreRunAdjustmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
