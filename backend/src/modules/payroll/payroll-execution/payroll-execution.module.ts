import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import controller and services 
import { PayrollExecutionController } from './controllers/payroll-execution.controller';
import { PayrollExecutionService } from './services/payroll-execution.service';
// import schemas from payroll-configuration subsystem
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from '../payroll-configuration/models/terminationAndResignationBenefits';
import { signingBonus, signingBonusSchema } from '../payroll-configuration/models/signingBonus.schema';
// import schemas from current subsystem
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { payrollDraft, payrollDraftSchema, payrollDraftItem, payrollDraftItemSchema } from './models/payrollDraft.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';
import { paySlip, paySlipSchema } from './models/payslip.schema';
import { PayCalculatorService } from './services/payCalculator.service';
import { PayrollDraftService } from './services/payroll-draft.service';
// import payroll-tracking module
import { PayrollTrackingModule } from '../payroll-tracking/payroll-tracking.module';
// import payroll-configuration module
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';
// import time-management module
import { TimeManagementModule } from '../../time-management/time-management.module';
// import employee module
import { EmployeeModule } from '../../employee/modules/employee.module';
// import leaves module
import { LeavesModule } from '../../leaves/modules/leaves.module';
// import auth module for guards/services
import { AuthModule } from '../../auth/module/auth-module';

@Module({
  imports: [forwardRef(() => PayrollTrackingModule), PayrollConfigurationModule, TimeManagementModule, EmployeeModule, LeavesModule, AuthModule,
  MongooseModule.forFeature([
    { name: payrollRuns.name, schema: payrollRunsSchema },
    { name: paySlip.name, schema: paySlipSchema },
    { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
    { name: payrollDraft.name, schema: payrollDraftSchema },
    { name: payrollDraftItem.name, schema: payrollDraftItemSchema },
    { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
    { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
    { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
    { name: signingBonus.name, schema: signingBonusSchema },
    { name: employeePenalties.name, schema: employeePenaltiesSchema },

  ])],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService, PayCalculatorService, PayrollDraftService],
  exports: [PayrollExecutionService, PayrollDraftService]
})
export class PayrollExecutionModule { }
