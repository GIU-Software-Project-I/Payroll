import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreatePayTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(6000)
  amount: number;

  @IsString()
  @IsNotEmpty()
  createdByEmployeeId: string;
}

