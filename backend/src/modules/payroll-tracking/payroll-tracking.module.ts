import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Employee, EmployeeSchema } from '../../schemas/employee.schema';
import { Department, DepartmentSchema } from '../../schemas/department.schema';
import { Payslip, PayslipSchema } from '../../schemas/payslip.schema';
import { Claim, ClaimSchema } from '../../schemas/claim.schema';
import { Dispute, DisputeSchema } from '../../schemas/dispute.schema';
import { Refund, RefundSchema } from '../../schemas/refund.schema';
import { AuditLog, AuditLogSchema } from '../../schemas/audit-log.schema';

import { PayrollTrackingService } from './payroll-tracking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Payslip.name, schema: PayslipSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: Refund.name, schema: RefundSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [PayrollTrackingService],
  exports: [MongooseModule, PayrollTrackingService],
})
export class PayrollConfigModule {}