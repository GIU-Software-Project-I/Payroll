// payslip.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayslipDocument = Payslip & Document;

export class PayslipItem {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  amount: number;
}

@Schema({ collection: 'payslips', timestamps: true })
export class Payslip {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  payrollCycle: Date;

  @Prop({ required: true })
  grossPay: number;

  @Prop({ required: true })
  netPay: number;

  @Prop({ default: 'generated' })
  status: string;

  @Prop()
  pdfUrl?: string;

  @Prop({ type: [PayslipItem], default: [] })
  items: PayslipItem[];
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
