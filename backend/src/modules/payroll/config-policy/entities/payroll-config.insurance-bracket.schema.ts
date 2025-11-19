import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InsuranceBracketDocument = InsuranceBracket & Document;

@Schema({ timestamps: true })
export class InsuranceBracket {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  // salary range where bracket applies
  @Prop({ required: true })
  fromSalary: number;

  @Prop()
  toSalary?: number;

  @Prop({ required: true })
  contributionEmployee: number; // percent e.g. 0.05 for 5%

  @Prop({ required: true })
  contributionEmployer: number;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const InsuranceBracketSchema = SchemaFactory.createForClass(InsuranceBracket);
InsuranceBracketSchema.index({ companyId: 1, code: 1 }, { unique: true });
