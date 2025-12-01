import { DisputeStatus } from '../../../enums/payroll-tracking/payroll-tracking-enum';

export class ApproveRejectDisputeDTO {
  status: DisputeStatus;
  rejectionReason?: string;
  resolutionComment?: string;
}


