import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PayGrade extends Document {
  @Prop({ required: true })
  name: string; // Example: "Grade A", "Senior", etc.

  @Prop({ required: true })
  baseSalary: number;

  @Prop({ required: true })
  currency: string; // EGP / USD / etc.
}

export const PayGradeSchema = SchemaFactory.createForClass(PayGrade);
