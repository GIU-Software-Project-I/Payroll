import { Injectable } from '@nestjs/common';
import { PayrollRunStatus } from '../payroll-process/run.status.dto';

@Injectable()
export class PayslipService {
  generatePayslipsForRun(runId: string, runStatus: PayrollRunStatus) {
    if (runStatus !== PayrollRunStatus.LOCKED) return { ok: false, message: 'Run not locked' };
    return { ok: true, generated: 1, message: `Payslips generated for ${runId}` };
  }
}
