import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ContractType, EmployeeStatus, WorkType } from '../../enums/employee-profile.enums';

export class AdminUpdateProfileDto {
    @IsOptional()
    @IsMongoId()
    primaryPositionId?: string;

    @IsOptional()
    @IsMongoId()
    primaryDepartmentId?: string;

    @IsOptional()
    @IsMongoId()
    supervisorPositionId?: string;

    @IsOptional()
    @IsEnum(EmployeeStatus)
    status?: EmployeeStatus;

    @IsOptional()
    @IsEnum(ContractType)
    contractType?: ContractType;

    @IsOptional()
    @IsEnum(WorkType)
    workType?: WorkType;

    @IsOptional()
    @IsDateString()
    dateOfHire?: string;

    @IsOptional()
    @IsDateString()
    contractStartDate?: string;

    @IsOptional()
    @IsDateString()
    contractEndDate?: string;

    @IsOptional()
    @IsString()
    workEmail?: string;
}
