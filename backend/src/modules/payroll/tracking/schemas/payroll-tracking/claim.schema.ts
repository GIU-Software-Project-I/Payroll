// claim.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClaimDocument = Claim & Document;

export class ClaimAction {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  actionType: string;

  @Prop()
  comment?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ collection: 'claims', timestamps: true })
export class Claim {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  amountClaimed?: number;

  @Prop()
  description?: string;

  @Prop([String])
  attachments?: string[];

  @Prop({ default: 'submitted' })
  status: string;

  @Prop({ type: [ClaimAction] })
  actions: ClaimAction[];
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
