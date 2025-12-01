import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { payrollRuns } from './payrollRuns.schema';

export type payrollDraftDocument = HydratedDocument<payrollDraft>

@Schema({ timestamps: true })
export class payrollDraft {
  @Prop({ required: true, unique: true })
  runId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: payrollRuns.name, required: true })
  payrollRunId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  payrollPeriod: Date;

  @Prop({ required: true })
  entity: string;

  @Prop({ required: true })
  totalEmployees: number;

  @Prop({ required: true })
  totalNetPay: number;

  @Prop({ required: true })
  exceptionCount: number;

  @Prop({ required: true })
  generatedBy: string;

  @Prop()
  generatedAt?: Date;
}

export const payrollDraftSchema = SchemaFactory.createForClass(payrollDraft);


@Schema({ timestamps: true })
export class payrollDraftItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: payrollDraft.name, required: true })
  payrollDraftId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  employeeId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  baseSalary: number;

  @Prop()
  allowances?: number;

  @Prop()
  deductions?: number;

  @Prop()
  penalties?: number;

  @Prop()
  refunds?: number;

  @Prop()
  bonus?: number;

  @Prop()
  benefit?: number;

  @Prop({ required: true })
  netPay: number;

  @Prop({ type: [String] })
  exceptions?: string[];

  @Prop({ default: 'ok' })
  status?: string;
}

export const payrollDraftItemSchema = SchemaFactory.createForClass(payrollDraftItem);
