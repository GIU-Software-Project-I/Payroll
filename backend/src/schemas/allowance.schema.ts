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
}

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);
