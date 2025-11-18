import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PayrollRunStatus } from '../../dto/payroll-process/run.status.dto';

@Schema({
  collection: 'payroll_runs',
  timestamps: true,
})
export class PayrollRun {
  @Prop({ type: Types.ObjectId, ref: 'PayrollPeriod', required: true })
  periodId: Types.ObjectId;

  @Prop({
    type: String,
    enum: PayrollRunStatus,
    default: PayrollRunStatus.PRE_RUN,
  })
  status: PayrollRunStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lockedBy?: Types.ObjectId;

  @Prop()
  unfreezeReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  unfrozenBy?: Types.ObjectId;
}

export type PayrollRunDocument = PayrollRun & Document;
export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);

// Helpful indexes for querying runs by period and status
PayrollRunSchema.index({ periodId: 1, status: 1 });
PayrollRunSchema.index({ status: 1, createdAt: -1 });
