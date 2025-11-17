import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApprovalDocument = Approval & Document;

@Schema({ _id: false, timestamps: false })
export class Approval {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  by: Types.ObjectId;

  @Prop({ required: true })
  role: string; // e.g., PayrollManager, HRManager, LegalAdmin

  @Prop({ required: true })
  action: string; // approve | reject

  @Prop()
  comment?: string;

  @Prop({ default: Date.now })
  at: Date;
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
