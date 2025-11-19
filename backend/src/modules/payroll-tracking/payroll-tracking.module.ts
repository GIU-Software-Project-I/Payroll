// src/modules/payroll-tracking/payroll-tracking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollTrackingService } from './payroll-tracking.service';

// Corrected schema imports
import { Employee, EmployeeSchema } from '../../schemas/payroll-tracking/employee.schema';
import { Department, DepartmentSchema } from '../../schemas/payroll-tracking/department.schema';
import { Payslip, PayslipSchema } from '../../schemas/payroll-tracking/payslip.schema';
import { Claim, ClaimSchema } from '../../schemas/payroll-tracking/claim.schema';
import { Dispute, DisputeSchema } from '../../schemas/payroll-tracking/dispute.schema';
import { Refund, RefundSchema } from '../../schemas/payroll-tracking/refund.schema';
import { AuditLog, AuditLogSchema } from '../../schemas/payroll-tracking/audit-log.schema';


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
export class PayrollTrackingModule {}
