import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class ActionDto {
  @IsMongoId()
  @IsNotEmpty()
  actorId: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  amountAdjusted?: number;
}
