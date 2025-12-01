import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveTaxRuleDto {
  @IsNotEmpty()
  @IsString()
  approvedBy: string;
}
