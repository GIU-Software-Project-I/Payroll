/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefundDocument = Refund & Document;

@Schema({ collection: 'refunds', timestamps: true })
export class Refund {
  @Prop({ type: Types.ObjectId, ref: 'Claim', unique: true })
  claimId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'scheduled' })
  status: string;

  @Prop({ required: true })
  scheduledPayrollCycle: Date;

  @Prop()
  processedAt?: Date;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);