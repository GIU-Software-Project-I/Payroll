import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HREventType } from '../../dto/payroll-process/hr.event.type.dto';

// ... existing code ...

@Schema({
  collection: 'payroll_items',
  timestamps: true,
})
export class PayrollItem {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  grossSalary: number;

  @Prop({ type: Number, required: true })
  taxAmount: number;

  @Prop({ type: Number, required: true })
  insuranceAmount: number;

  @Prop({ type: Number, required: true })
  penaltiesAmount: number;

  @Prop({ type: Number, required: true })
  netSalary: number;

  @Prop({ type: Number, required: true })
  finalSalary: number;

  @Prop({ type: String, enum: HREventType, default: HREventType.NORMAL })
  hrEventType: HREventType;

  @Prop({ type: Number, default: 0 })
  signingBonusAmount: number;

  @Prop({ type: Number, default: 0 })
  terminationBenefitsAmount: number;

  @Prop({ type: Number, default: 0 })
  resignationBenefitsAmount: number;

  @Prop({ default: false })
  missingBankDetails: boolean;

  @Prop({ default: false })
  negativeNetPay: boolean;

  @Prop({ type: Object })
  breakdown: Record<string, unknown>;
}

export type PayrollItemDocument = PayrollItem & Document;
export const PayrollItemSchema = SchemaFactory.createForClass(PayrollItem);

// ... existing code ...