// dispute.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DisputeDocument = Dispute & Document;

export class DisputeResolution {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  amountAdjusted?: number;

  @Prop()
  comment?: string;
}

@Schema({ collection: 'disputes', timestamps: true })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Payslip', required: true })
  payslipId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Claim' })
  claimId?: Types.ObjectId;

  @Prop({ required: true })
  type: string; // e.g., "salary_error", "deduction_error"

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'pending' })
  status: string; // "pending" | "in_review" | "approved" | "rejected"

  @Prop({ type: DisputeResolution })
  resolution?: DisputeResolution;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
