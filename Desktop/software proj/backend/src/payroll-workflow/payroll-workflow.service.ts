import { Injectable } from '@nestjs/common';
import { PayrollRunStatus } from '../payroll-process/run.status.dto';
import { PayrollExceptionDto } from '../payroll-process/exception.dto';
import { ApprovalResult } from '../payroll-process/approval.result.dto';
import { ReviewNoteDto } from '../payroll-process/review.note.dto';
import { PayrollNotificationService } from './payroll-notification.service';
import { PayrollAuditService } from './audit.service';
import { PayslipService } from './payslip.service';

export interface PayrollRun {
  id: string;
  status: PayrollRunStatus;
  exceptions: PayrollExceptionDto[];
  notes: ReviewNoteDto[];
}

@Injectable()
export class PayrollWorkflowService {
  private runs = new Map<string, PayrollRun>();

  constructor(
    private notifier: PayrollNotificationService,
    private audit: PayrollAuditService,
    private payslipService: PayslipService,
  ) {}

  createRun(id: string, exceptions: PayrollExceptionDto[] = []) {
    const run: PayrollRun = { id, status: PayrollRunStatus.DRAFT_GENERATED, exceptions, notes: [] };
    this.runs.set(id, run);
    this.audit.record({ runId: id, action: 'CREATE_RUN' });
    return run;
  }

  getRun(id: string) {
    return this.runs.get(id) ?? null;
  }

  publishForReview(id: string) {
    const run = this.getRun(id);
    if (!run) return null;
    run.status = PayrollRunStatus.UNDER_REVIEW;
    this.audit.record({ runId: id, action: 'PUBLISH_FOR_REVIEW' });
    this.notifier.notifyPayrollManager('Payroll published for review', { runId: id });
    return run;
  }

  managerDecision(id: string, result: ApprovalResult, note?: ReviewNoteDto) {
    const run = this.getRun(id);
    if (!run) return null;
    if (note) run.notes.push(note);
    this.audit.record({ runId: id, action: `MANAGER_${result}`, reason: note?.note });
    if (result === ApprovalResult.APPROVED) {
      run.status = PayrollRunStatus.WAITING_FINANCE_APPROVAL;
      this.notifier.notifyFinanceStaff('Payroll waiting your approval', { runId: id });
    } else {
      run.status = PayrollRunStatus.DRAFT_GENERATED; 
      this.notifier.notifyPayrollSpecialists('Payroll rejected by manager; please correct', { runId: id, reason: note?.note });
    }
    return run;
  }

  financeDecision(id: string, result: ApprovalResult, note?: ReviewNoteDto) {
    const run = this.getRun(id);
    if (!run) return null;
    if (note) run.notes.push(note);
    this.audit.record({ runId: id, action: `FINANCE_${result}`, reason: note?.note });
    if (result === ApprovalResult.APPROVED) {
      run.status = PayrollRunStatus.LOCKED;
      this.notifier.notifyPayrollManager('Payroll approved by finance; please lock/freeze', { runId: id });
      const gen = this.payslipService.generatePayslipsForRun(id, run.status);
      this.audit.record({ runId: id, action: 'PAYSLS_GENERATED', reason: JSON.stringify(gen) });
    } else {
      run.status = PayrollRunStatus.DRAFT_GENERATED;
      this.notifier.notifyPayrollSpecialists('Payroll rejected by finance; please correct', { runId: id, reason: note?.note });
    }
    return run;
  }

  lockRun(id: string) {
    const run = this.getRun(id);
    if (!run) return null;
    run.status = PayrollRunStatus.LOCKED;
    this.audit.record({ runId: id, action: 'LOCK' });
    return run;
  }

  unfreezeRun(id: string, justification: string) {
    const run = this.getRun(id);
    if (!run) return null;
    run.notes.push({ authorId: 'system', role: 'PAYROLL_MANAGER', note: `Unfreeze: ${justification}`, createdAt: new Date().toISOString() });
    run.status = PayrollRunStatus.UNFROZEN;
    this.audit.record({ runId: id, action: 'UNFREEZE', reason: justification });
    this.notifier.notifyPayrollSpecialists('Payroll unfreezed by manager', { runId: id, justification });
    return run;
  }
}
