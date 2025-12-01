import { IsString, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTerminationBenefitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsNotEmpty()
  createdByEmployeeId: string;
}

