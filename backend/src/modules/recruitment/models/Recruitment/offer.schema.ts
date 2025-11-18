import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

export enum OfferStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
}

@Schema({ timestamps: true })
export class Offer {
  // rec014: which application the offer is for
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  application!: Types.ObjectId;

  // rec014: proposed salary amount
  @Prop()
  salary?: number;

  // rec014: currency for salary
  @Prop()
  currency?: string; // LINK TO PAYROLL

  // rec014: proposed start date
  @Prop()
  startDate?: Date;

  // rec014: offer status (pending/accepted/rejected/withdrawn)
  @Prop({ default: OfferStatus.PENDING,enum: Object.values(OfferStatus) })
  status?: OfferStatus;

  // rec014/rec018: textual terms or template reference
  @Prop({ default: '' })
  terms?: string;

  // rec014: user who issued the offer
  @Prop({ type: Types.ObjectId, ref: 'HR' })
  issuedBy?: Types.ObjectId; // SEE WHO IS RESPONSIBLE FOR THESE

  // rec014: audit trail of actions on the offer
  @Prop([{ action: String, by: Types.ObjectId, at: Date, note: String }])
  audit?: { action: string; by?: Types.ObjectId; at: Date; note?: string }[];

  // rec014: approval steps (role-based approvals)
  @Prop([{ role: String, approver: Types.ObjectId, status: String, at: Date }])
  approvals?: { role?: string; approver?: Types.ObjectId; status?: string; at?: Date }[];

  // rec018: e-signature timestamp
  @Prop()
  signedAt?: Date;

  // rec018: link to signed document
  @Prop()
  signatureUrl?: string;

  // rec029: whether onboarding/pre-boarding was triggered after acceptance
  @Prop({ default: false })
  onboardingTriggered?: boolean;

  // rec029: optional list of pre-boarding tasks created on handoff
  @Prop([String])
  preboardingTasks?: string[];

  @Prop()
  expiresAt?: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
