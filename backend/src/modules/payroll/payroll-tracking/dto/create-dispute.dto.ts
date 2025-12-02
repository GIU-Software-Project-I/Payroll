import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDisputeDTO {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  payslipId!: string;
}


