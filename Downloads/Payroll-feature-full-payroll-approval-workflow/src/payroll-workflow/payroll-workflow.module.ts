import { Module } from '@nestjs/common';
import { PayrollWorkflowService } from './payroll-workflow.service';
import { PayrollNotificationService } from './payroll-notification.service';
import { PayrollAuditService } from './audit.service';
import { PayslipService } from './payslip.service';

@Module({
  providers: [
    PayrollNotificationService,
    PayrollAuditService,
    PayslipService,
    PayrollWorkflowService,
  ],
  exports: [PayrollWorkflowService],
})
export class PayrollWorkflowModule {}
