import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AdminAssignRoleDto {
    @IsNotEmpty()
    @IsMongoId()
    accessProfileId: string;
}
