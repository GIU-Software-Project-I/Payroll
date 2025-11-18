import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HREventType } from '../../dto/payroll-process/hr.event.type.dto';

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

  // enforce non-negative numeric values per business rules
  @Prop({ type: Number, required: true, min: 0 })
  grossSalary: number;

  @Prop({ type: Number, required: true, min: 0 })
  taxAmount: number;

  @Prop({ type: Number, required: true, min: 0 })
  insuranceAmount: number;

  @Prop({ type: Number, required: true, min: 0 })
  penaltiesAmount: number;

  @Prop({ type: Number, required: true, min: 0 })
  netSalary: number;

  @Prop({ type: Number, required: true, min: 0 })
  finalSalary: number;

  @Prop({ type: String, enum: HREventType, default: HREventType.NORMAL })
  hrEventType: HREventType;

  @Prop({ type: Number, default: 0, min: 0 })
  signingBonusAmount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  terminationBenefitsAmount: number;

  @Prop({ type: Number, default: 0, min: 0 })
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

// Helpful indexes for typical queries in payroll runs
PayrollItemSchema.index({ payrollRunId: 1, employeeId: 1 });
PayrollItemSchema.index({ payrollRunId: 1, departmentId: 1 });
PayrollItemSchema.index({ payrollRunId: 1, negativeNetPay: 1 });
PayrollItemSchema.index({ payrollRunId: 1, createdAt: -1 });