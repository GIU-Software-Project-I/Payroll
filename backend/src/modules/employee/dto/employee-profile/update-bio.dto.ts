import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateBioDto {
    @IsOptional()
    @IsString()
    biography?: string;

    @IsOptional()
    @IsUrl()
    profilePictureUrl?: string;
}
