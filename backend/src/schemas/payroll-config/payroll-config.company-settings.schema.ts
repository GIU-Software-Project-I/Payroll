import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanySettingsDocument = CompanySettings & Document;

@Schema({ timestamps: true })
export class CompanySettings {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  currency: string; // e.g. "USD", "EGP"

  @Prop({ required: true })
  payFrequency: string; // monthly, biweekly, weekly

  @Prop({ required: true })
  payDate: string; // day-of-month or rule e.g. "last-business-day"

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop() // optional timezone for calculations
  timezone: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const CompanySettingsSchema = SchemaFactory.createForClass(CompanySettings);
CompanySettingsSchema.index({ companyId: 1 });
