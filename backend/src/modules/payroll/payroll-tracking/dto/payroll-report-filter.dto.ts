import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class PayrollReportFilterDTO {
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsOptional()
  departmentId?: string;
}


