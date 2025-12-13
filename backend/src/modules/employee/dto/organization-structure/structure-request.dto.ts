import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ApprovalDecision,
  StructureRequestStatus,
  StructureRequestType,
} from '../../enums/organization-structure.enums';

export class SubmitStructureRequestDto {
  @IsString()
  @IsOptional()
  requestNumber?: string;

  @IsMongoId()
  @IsNotEmpty()
  requestedByEmployeeId: string;

  @IsEnum(StructureRequestType)
  requestType: StructureRequestType;

  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateStructureRequestDto extends PartialType(
  SubmitStructureRequestDto,
) {
  @IsEnum(StructureRequestStatus)
  @IsOptional()
  status?: StructureRequestStatus;
}

export class SubmitApprovalDecisionDto {
  @IsMongoId()
  @IsNotEmpty()
  approverEmployeeId: string;

  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsString()
  @IsOptional()
  comments?: string;
}

