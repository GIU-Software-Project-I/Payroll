import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayGradeDocument = PayGrade & Document;

@Schema({ timestamps: true })
export class PayGrade {
  @Prop({ required: true, index: true })
  code: string; // PG-1 etc.

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  title: string; // e.g., "Senior Engineer"

  @Prop({ required: true })
  baseSalary: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Allowance' }], default: [] })
  allowances: Types.ObjectId[]; // references to Allowance documents

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Deduction' }], default: [] })
  deductions: Types.ObjectId[];

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop()
  effectiveFrom?: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const PayGradeSchema = SchemaFactory.createForClass(PayGrade);
PayGradeSchema.index({ companyId: 1, code: 1 }, { unique: true });
