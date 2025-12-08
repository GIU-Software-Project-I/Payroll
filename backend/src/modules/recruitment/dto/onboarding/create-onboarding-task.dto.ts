import { IsString, IsNotEmpty, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOnboardingTaskDto {
    @ApiProperty({ description: 'Task name', example: 'Complete I-9 Form' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Department responsible', example: 'HR' })
    @IsString()
    @IsNotEmpty()
    department: string;

    @ApiPropertyOptional({ description: 'Task deadline', example: '2025-12-31T00:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    deadline?: string;

    @ApiPropertyOptional({ description: 'Document ID if task requires document upload', example: '507f1f77bcf86cd799439013' })
    @IsMongoId()
    @IsOptional()
    documentId?: string;

    @ApiPropertyOptional({ description: 'Additional notes', example: 'Must be completed before first day' })
    @IsString()
    @IsOptional()
    notes?: string;
}

