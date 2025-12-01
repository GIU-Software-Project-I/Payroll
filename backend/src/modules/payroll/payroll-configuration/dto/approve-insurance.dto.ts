import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveInsuranceDto {
  @IsNotEmpty()
  @IsString()
  approvedBy: string;
}
//making sure