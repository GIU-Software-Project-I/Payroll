import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { SystemRole } from '../../employee/enums/employee-profile.enums';
import { Type } from 'class-transformer';

export class RegisterEmployeeDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsString()
  nationalId!: string;

  @IsNotEmpty()
  @IsEmail()
  workEmail!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  @IsString()
  employeeNumber!: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfHire!: string;

  @IsArray()
  @IsEnum(SystemRole, { each: true })
  @Type(() => String)
  roles!: SystemRole[];

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  personalEmail?: string;
}

