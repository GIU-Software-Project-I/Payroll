import { IsOptional, IsDateString } from 'class-validator';

export class PayslipQueryDto {
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}

