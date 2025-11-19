import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaxRuleDocument = TaxRule & Document;

@Schema({ timestamps: true })
export class TaxRule {
  @Prop({ required: true })
  jurisdiction: string; // e.g., "Egypt", "CA-ON" for Ontario, Canada

  @Prop({ type: Array, default: [] })
  brackets: { from: number; to?: number; rate: number }[]; // rate as decimal e.g., 0.15

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

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
}

export const TaxRuleSchema = SchemaFactory.createForClass(TaxRule);
TaxRuleSchema.index({ companyId: 1, jurisdiction: 1 });
