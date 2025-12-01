import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateTerminationBenefitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  terms?: string;
}

