import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import controllers and services of the current subsystem
import { PayrollTrackingController } from './controllers/payroll-tracking.controller';
import { PayrollTrackingService } from './services/payroll-tracking.service';
// import schemas of the current subsystem
import { refunds, refundsSchema } from './models/refunds.schema';
import { claims, claimsSchema } from './models/claims.schema';
import { disputes, disputesSchema } from './models/disputes.schema';
// import payroll-execution module & schemas
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { paySlip, paySlipSchema } from '../payroll-execution/models/payslip.schema';
// import payroll-configuration module
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';

@Module({
  imports: [
    PayrollConfigurationModule,
    forwardRef(() => PayrollExecutionModule),
    MongooseModule.forFeature([
      { name: refunds.name, schema: refundsSchema },
      { name: claims.name, schema: claimsSchema },
      { name: disputes.name, schema: disputesSchema },
      { name: paySlip.name, schema: paySlipSchema },
    ]),
  ],
  controllers: [PayrollTrackingController],
  providers: [PayrollTrackingService],
  exports: [PayrollTrackingService],
})
export class PayrollTrackingModule {}
