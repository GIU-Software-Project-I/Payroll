import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDisputeDto {
  @IsMongoId()
  @IsNotEmpty()
  payslipId: string;

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  claimId?: string;
}
