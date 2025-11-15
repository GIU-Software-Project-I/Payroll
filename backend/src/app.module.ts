import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { TimeManagementModule } from './modules/time-management/time-management.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { LeavesModule } from './modules/leaves/leaves.module';

@Module({
  imports: [EmployeeModule, PayrollModule, TimeManagementModule, RecruitmentModule, LeavesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
