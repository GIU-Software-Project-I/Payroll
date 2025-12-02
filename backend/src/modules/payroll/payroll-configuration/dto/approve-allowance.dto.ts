import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAllowanceDto {
  @IsNotEmpty()
  @IsString()
  approvedBy: string; // Employee ID of the Payroll Manager approving/rejecting
}