import { PayrollAnalyzerService } from './payroll-analyzer.service';
import { PayrollRunStatus } from './run.status.dto';

describe('PayrollAnalyzerService', () => {
  let svc: PayrollAnalyzerService;

  beforeEach(() => {
    svc = new PayrollAnalyzerService();
  });

  it('flags missing bank account and negative net pay', () => {
    const rows = [
      { employeeId: 'e1', bankAccount: null, netPay: 100 },
      { employeeId: 'e2', bankAccount: '123', netPay: -50 },
      { employeeId: 'e3', bankAccount: '456', netPay: 200 },
    ];

    const res = svc.detectAnomalies(rows);

    expect(res.status).toBe(PayrollRunStatus.UNDER_REVIEW);
    expect(res.exceptions.length).toBe(2);
    const codes = res.exceptions.map(e => e.code).sort();
    expect(codes).toEqual(['MISSING_BANK', 'NEGATIVE_NET_PAY'].sort());
  });

  it('returns DRAFT_GENERATED when no anomalies', () => {
    const rows = [{ employeeId: 'e1', bankAccount: 'abc', netPay: 100 }];
    const res = svc.detectAnomalies(rows);
    expect(res.status).toBe(PayrollRunStatus.DRAFT_GENERATED);
    expect(res.exceptions.length).toBe(0);
  });
});
