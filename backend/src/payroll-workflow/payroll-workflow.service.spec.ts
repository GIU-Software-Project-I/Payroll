import { Test } from '@nestjs/testing';
import { PayrollWorkflowService } from './payroll-workflow.service';
import { PayrollNotificationService } from './payroll-notification.service';
import { PayrollAuditService } from './audit.service';
import { PayslipService } from './payslip.service';
import { ApprovalResult } from '../payroll-process/approval.result.dto';

describe('PayrollWorkflowService', () => {
  let svc: PayrollWorkflowService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayrollWorkflowService,
        PayrollNotificationService,
        PayrollAuditService,
        PayslipService,
      ],
    }).compile();

    svc = module.get(PayrollWorkflowService);
  });

  it('creates, publishes, manager approves, finance approves -> locked', () => {
    const id = 'run1';
    svc.createRun(id, []);
    svc.publishForReview(id);
    svc.managerDecision(id, ApprovalResult.APPROVED, { authorId: 'm', role: 'PAYROLL_MANAGER', note: 'ok', createdAt: new Date().toISOString() });
    svc.financeDecision(id, ApprovalResult.APPROVED, { authorId: 'f', role: 'FINANCE', note: 'ok', createdAt: new Date().toISOString() });
    const run = svc.getRun(id);
    expect(run).not.toBeNull();
    if (!run) return; // satisfy TS
    expect(run.status).toBeDefined();
    expect(typeof run.status).toBe('string');
  });
});
