import { ApiProperty } from '@nestjs/swagger';
export class PayrollInitiationCreateDto {
  @ApiProperty({ required: false, description: 'Optional run id. If omitted server will generate.' })
  runId?: string;

  @ApiProperty({ description: 'Payroll period (ISO date representing period end)' })
  payrollPeriod: string;

  @ApiProperty({ description: 'Entity/company name' })
  entity: string;

  @ApiProperty({ description: 'Number of employees included in run' })
  employees: number;

  @ApiProperty({ description: 'Number of exceptions detected' })
  exceptions: number;

  @ApiProperty({ description: 'Total net pay for the run' })
  totalnetpay: number;
}
