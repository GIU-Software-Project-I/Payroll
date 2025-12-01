// src/time-management/dto/time-exception.dtos.ts
import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';

export class CreateExceptionDto {
    @IsNotEmpty()
    employeeId!: string;

    @IsNotEmpty()
    attendanceRecordId!: string;

    @IsEnum(TimeExceptionType)
    type!: TimeExceptionType;

    @IsOptional()
    @IsString()
    reason?: string;

    // optional initial assignee
    @IsOptional()
    assignedTo?: string;
}

export class AssignExceptionDto {
    @IsNotEmpty()
    exceptionId!: string;

    @IsNotEmpty()
    assigneeId!: string;
}

export class UpdateExceptionStatusDto {
    @IsNotEmpty()
    exceptionId!: string;

    @IsEnum(TimeExceptionStatus)
    status!: TimeExceptionStatus;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class ExceptionQueryDto {
    @IsOptional()
    status?: TimeExceptionStatus;

    @IsOptional()
    type?: TimeExceptionType;

    @IsOptional()
    employeeId?: string;

    @IsOptional()
    assignedTo?: string;
}
