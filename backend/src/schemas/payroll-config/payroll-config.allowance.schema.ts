import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Allowance extends Document {
  @Prop({ required: true })
  name: string; // Transportation, Housing, etc.

  @Prop({ required: true })
  amount: number;

  @Prop({ default: false })
  isPercentage: boolean; // If true → amount is percentage

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: 'draft', enum: ['draft','active','archived'] })
  status: string;

  @Prop()
  effectiveFrom?: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop({ type: String, enum: ['fixed','percentage','formula'], default: 'fixed' })
  type: string;
}

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);

