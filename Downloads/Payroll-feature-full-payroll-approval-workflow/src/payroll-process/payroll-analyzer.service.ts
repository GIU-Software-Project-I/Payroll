import { PayrollExceptionDto } from './exception.dto';
import { PayrollRunStatus } from './run.status.dto';

export class PayrollAnalyzerService {
  
  detectAnomalies(
    rows: Array<{ employeeId: string; bankAccount?: string | null; netPay: number }>,
  ): { exceptions: PayrollExceptionDto[]; status: PayrollRunStatus } {
    const exceptions: PayrollExceptionDto[] = [];

    rows.forEach((r) => {
      if (!r.bankAccount) {
        exceptions.push({
          employeeId: r.employeeId,
          code: 'MISSING_BANK',
          message: 'Missing bank account details',
          field: 'bankAccount',
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      if (typeof r.netPay === 'number' && r.netPay < 0) {
        exceptions.push({
          employeeId: r.employeeId,
          code: 'NEGATIVE_NET_PAY',
          message: 'Net pay is negative',
          field: 'netPay',
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    const status = exceptions.length > 0 ? PayrollRunStatus.UNDER_REVIEW : PayrollRunStatus.DRAFT_GENERATED;

    return { exceptions, status };
  }
}
