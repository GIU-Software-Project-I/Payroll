import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  objectType: string;

  @Prop({ type: Types.ObjectId, required: true })
  objectId: Types.ObjectId;

  @Prop({ type: Object })
  details?: any;

  @Prop({ default: Date.now })
  timestamp: Date;
}

// eslint-disable-next-line prettier/prettier
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);