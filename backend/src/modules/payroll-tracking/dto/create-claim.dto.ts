import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClaimDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsNumber()
  amountClaimed?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  attachments?: string[];
}
