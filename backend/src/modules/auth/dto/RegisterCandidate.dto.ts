import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterCandidateDto {
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
  personalEmail!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;


  @IsNotEmpty()
  @IsString()
  mobilePhone!: string;

  @IsOptional()
  @IsString()
  middleName?: string;
}

