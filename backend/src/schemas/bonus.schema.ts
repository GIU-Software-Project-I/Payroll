import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Bonus extends Document {
  @Prop({ required: true })
  name: string; // Signing Bonus

  @Prop({ required: true })
  amount: number;

  @Prop()
  description?: string;
}

export const BonusSchema = SchemaFactory.createForClass(Bonus);
