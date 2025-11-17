import { Injectable } from '@nestjs/common';
import { AuditEntryDto } from './audit.dto';

@Injectable()
export class PayrollAuditService {
  private entries: AuditEntryDto[] = [];

  record(entry: AuditEntryDto) {
    entry.createdAt = new Date().toISOString();
    this.entries.push(entry);
    return entry;
  }

  listForRun(runId: string) {
    return this.entries.filter((e) => e.runId === runId);
  }
}
