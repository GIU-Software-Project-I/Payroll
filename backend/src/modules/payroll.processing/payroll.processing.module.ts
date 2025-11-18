import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollProcessingService } from './payroll.processing.service';
import { PayrollProcessingController } from './payroll.processing.controller';
import {
  ApprovalAction,
  ApprovalActionSchema,
} from '../../schemas/payroll-processing/approval.action.schema';
import {
  PayrollItem,
  PayrollItemSchema,
} from '../../schemas/payroll-processing/payroll.item.schema';
import { PayrollRun, PayrollRunSchema } from '../../schemas/payroll-processing/payroll.run.schema';
import { PreRunAdjustment, PreRunAdjustmentSchema } from '../../schemas/payroll-processing/pre.run.adjustment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApprovalAction.name, schema: ApprovalActionSchema },
      { name: PayrollItem.name, schema: PayrollItemSchema },
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: PreRunAdjustment.name, schema: PreRunAdjustmentSchema },
    ]),
  ],
  providers: [PayrollProcessingService],
  controllers: [PayrollProcessingController],
})
export class PayrollProcessingModule {}
