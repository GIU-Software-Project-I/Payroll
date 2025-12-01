import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PayrollTrackingController } from './payroll-tracking.controller';
import { PayrollTrackingService } from './payroll-tracking.service';

import { refunds, refundsSchema } from '../../schemas/payroll-tracking/refunds.schema';
import { claims, claimsSchema } from '../../schemas/payroll-tracking/claims.schema';
import { disputes, disputesSchema } from '../../schemas/payroll-tracking/disputes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: refunds.name, schema: refundsSchema },
      { name: claims.name, schema: claimsSchema },
      { name: disputes.name, schema: disputesSchema },
    ]),
  ],
  controllers: [PayrollTrackingController],
  providers: [PayrollTrackingService],
  exports: [PayrollTrackingService],
})
export class PayrollTrackingModule {}
