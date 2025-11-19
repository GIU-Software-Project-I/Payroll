import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayTypeDocument = PayType & Document;

@Schema({ timestamps: true })
export class PayType {
  @Prop({ required: true })
  code: string; // e.g., "BASE", "BONUS"

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const PayTypeSchema = SchemaFactory.createForClass(PayType);
PayTypeSchema.index({ companyId: 1, code: 1 }, { unique: true });
