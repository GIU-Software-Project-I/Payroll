import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateTaxRuleDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;
}
