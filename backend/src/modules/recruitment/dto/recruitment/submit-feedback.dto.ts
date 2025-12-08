import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * REC-011: Provide feedback/interview score for scheduled interviews
 * The system must allow adding comments and ratings at each stage
 */

export class SubmitFeedbackDto {
    @ApiProperty({ description: 'Interview ID' })
    @IsMongoId()
    @IsNotEmpty()
    interviewId: string;

    @ApiProperty({ description: 'Interviewer ID' })
    @IsMongoId()
    @IsNotEmpty()
    interviewerId: string;

    @ApiProperty({ description: 'Score (0-100)', example: 85 })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiPropertyOptional({ description: 'Comments and feedback' })
    @IsString()
    @IsOptional()
    comments?: string;
}
