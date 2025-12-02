import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TaxDocumentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  year?: number;
}

