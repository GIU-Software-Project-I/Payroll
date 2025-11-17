export interface AuditEntryDto {
  id?: string;
  runId: string;
  actorId?: string;
  action: string;
  reason?: string;
  createdAt?: string;
}
