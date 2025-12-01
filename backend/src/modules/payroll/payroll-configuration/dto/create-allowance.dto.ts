import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateAllowanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  createdByEmployeeId: string;
}

