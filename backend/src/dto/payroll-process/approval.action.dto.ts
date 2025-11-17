export enum ApprovalActionType {
  PUBLISH = 'PUBLISH',
  MANAGER_APPROVE = 'MANAGER_APPROVE',
  MANAGER_REJECT = 'MANAGER_REJECT',
  FINANCE_APPROVE = 'FINANCE_APPROVE',
  FINANCE_REJECT = 'FINANCE_REJECT',
  LOCK = 'LOCK',
  UNFREEZE = 'UNFREEZE',

  // Component-level reviews for payroll initiation prerequisites
  SIGNING_BONUS_APPROVE = 'SIGNING_BONUS_APPROVE',
  SIGNING_BONUS_REJECT = 'SIGNING_BONUS_REJECT',
  TERMINATION_BENEFITS_APPROVE = 'TERMINATION_BENEFITS_APPROVE',
  TERMINATION_BENEFITS_REJECT = 'TERMINATION_BENEFITS_REJECT',
  RESIGNATION_BENEFITS_APPROVE = 'RESIGNATION_BENEFITS_APPROVE',
  RESIGNATION_BENEFITS_REJECT = 'RESIGNATION_BENEFITS_REJECT',
}

// Review DTOs (approve / reject)
// These are used to record an ApprovalAction for a payroll run.

export class SigningBonusReviewDto {
  actorId: string;
  actorRole: string;
  approve: boolean;
  reason?: string;
}

export class TerminationBenefitsReviewDto {
  actorId: string;
  actorRole: string;
  approve: boolean;
  reason?: string;
}

export class ResignationBenefitsReviewDto {
  actorId: string;
  actorRole: string;
  approve: boolean;
  reason?: string;
}

// Edit DTOs (change amounts on payroll items)

export class SigningBonusEditDto {
  newAmount: number;
}

export class TerminationBenefitsEditDto {
  newAmount: number;
}

export class ResignationBenefitsEditDto {
  newAmount: number;
}
