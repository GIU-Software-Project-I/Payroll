export type ReviewerRole = 'PAYROLL_SPECIALIST' | 'PAYROLL_MANAGER' | 'FINANCE';

export interface ReviewNoteDto {
  id?: string;
  authorId: string;
  role: ReviewerRole;
  note: string;
  createdAt?: string;
}
