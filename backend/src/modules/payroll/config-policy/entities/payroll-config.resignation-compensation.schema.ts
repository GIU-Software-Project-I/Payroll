import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResignationCompensationDocument = ResignationCompensation & Document;

@Schema({ timestamps: true })
export class ResignationCompensation {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Object }) // flexible rules, formula, caps
  calculationRule: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const ResignationCompensationSchema = SchemaFactory.createForClass(ResignationCompensation);
ResignationCompensationSchema.index({ companyId: 1, code: 1 }, { unique: true });
