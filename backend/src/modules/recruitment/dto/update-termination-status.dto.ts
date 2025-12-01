import { TerminationStatus } from '../enums/termination-status.enum';

export class UpdateTerminationStatusDto {
  terminationId: string;
  status: TerminationStatus;
  terminationDate?: Date;
  hrComments?: string;
}

