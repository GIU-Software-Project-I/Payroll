import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateTaxRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rate?: number;
}

