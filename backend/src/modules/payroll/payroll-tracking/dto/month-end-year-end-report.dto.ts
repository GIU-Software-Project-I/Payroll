import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ReportType {
  MONTH_END = 'month-end',
  YEAR_END = 'year-end',
}

export class MonthEndYearEndReportFilterDTO {
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsEnum(ReportType)
  @IsOptional()
  reportType?: ReportType;
}


