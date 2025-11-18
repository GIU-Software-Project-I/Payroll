import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditTrailDocument = AuditTrail & Document;

@Schema()
export class AuditTrail {
    @Prop({ required: true })
    timestamp!: Date;

    @Prop({ required: true })
    changedBy!: string; // e.g., user ID or name

    @Prop({ required: true })
    field!: string; // e.g., 'type', 'effectiveFrom'

    @Prop({ type: Object }) // Optional: stores old value (e.g., previous enum or date)
    oldValue?: any;

    @Prop({ type: Object }) // Optional: stores new value
    newValue?: any;

    @Prop() // Optional: reason for change (e.g., 'Policy update')
    reason?: string;
}

export const AuditTrailEntrySchema = SchemaFactory.createForClass(AuditTrail);