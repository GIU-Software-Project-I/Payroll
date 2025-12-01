import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateSigningBonusDto {
  @IsString()
  @IsNotEmpty()
  positionName: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  createdByEmployeeId: string;
}

