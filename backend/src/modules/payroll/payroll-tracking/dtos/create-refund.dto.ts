import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class CreateRefundDto {
    @IsOptional()
    @IsMongoId()
    claimId?: string;

    @IsOptional()
    @IsMongoId()
    disputeId?: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;
}