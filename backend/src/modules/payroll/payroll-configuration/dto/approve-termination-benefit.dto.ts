import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveTerminationBenefitDto {
  @IsNotEmpty()
  @IsString()
  approvedBy: string; // Employee ID of the HR/Payroll Specialist approving
}