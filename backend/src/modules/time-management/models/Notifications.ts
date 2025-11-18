import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuditTrail } from './AuditTrail';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
    @Prop({ required: true })
    id!: string; // Primary Key

    @Prop({ required: true })
    recipientId!: string; // Reference → Employee/User

    @Prop()
    senderId?: string; // Reference → Employee/User/System (optional)

    @Prop({ required: true })
    message!: string; // Human-readable content

    @Prop()
    relatedEntityId?: string; // Reference → ShiftAssignment or Shift (optional)

    @Prop({
        required: true,
        enum: ['Unread', 'Read', 'Archived'],
        default: 'Unread',
    })
    status!: string; // Tracks user interaction

    @Prop({ required: true, default: Date.now })
    createdAt!: Date; // When notification was generated

    @Prop({ type: [AuditTrail], default: [] })
    auditTrail!: AuditTrail[]; // Optional audit trail entries
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
