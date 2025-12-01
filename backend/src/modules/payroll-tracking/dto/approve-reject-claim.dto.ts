import { ClaimStatus } from '../../../enums/payroll-tracking/payroll-tracking-enum';

export class ApproveRejectClaimDTO {
  status: ClaimStatus;
  approvedAmount?: number;
  rejectionReason?: string;
  resolutionComment?: string;
}


