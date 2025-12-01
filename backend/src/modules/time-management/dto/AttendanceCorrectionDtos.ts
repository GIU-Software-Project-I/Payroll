import { IsNotEmpty, IsString } from 'class-validator';

export class RequestCorrectionDto {
    @IsNotEmpty()
    employeeId: string;

    @IsNotEmpty()
    attendanceRecordId: string;

    @IsString()
    reason: string;
}

export class ReviewCorrectionDto {
    @IsNotEmpty()
    correctionRequestId: string;

    @IsNotEmpty()
    reviewerId: string;

    @IsNotEmpty()
    action: 'APPROVE' | 'REJECT';

    @IsString()
    note?: string;
}
