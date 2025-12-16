import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './controllers/finance.controller';
import { FinanceService } from './services/finance.service';
import { paySlip, paySlipSchema } from '../payroll/payroll-execution/models/payslip.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee/models/employee/employee-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: paySlip.name, schema: paySlipSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}