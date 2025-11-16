import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PayType extends Document {
  @Prop({ required: true })
  name: string; // Hourly, Monthly, Contract, etc.

  @Prop({ required: true })
  description: string;
}

export const PayTypeSchema = SchemaFactory.createForClass(PayType);
