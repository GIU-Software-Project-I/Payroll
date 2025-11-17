import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeductionDocument = Deduction & Document;

@Schema({ timestamps: true })
export class Deduction {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ['fixed','percentage','legal','voluntary'], default: 'fixed' })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ default: true })
  preTax: boolean;

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const DeductionSchema = SchemaFactory.createForClass(Deduction);
DeductionSchema.index({ companyId: 1, code: 1 }, { unique: true });
