import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateClaimDTO {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  claimType!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}


