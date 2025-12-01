import { Types } from 'mongoose';

export class UpdateClearanceSignOffDto {
  terminationId: string;
  department: string;
  status: string;
  comments?: string;
  updatedBy?: Types.ObjectId;
}

