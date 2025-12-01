import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdatePayTypeDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(6000)
  @IsOptional()
  amount?: number;
}

