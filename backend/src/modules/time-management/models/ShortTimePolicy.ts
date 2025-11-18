import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {AuditTrail} from "./AuditTrail";

export type ShortTimePolicyDocument = ShortTimePolicy & Document;

@Schema()
export class ShortTimePolicy {
    @Prop({ required: true })
    id!: string; // Primary Key




    @Prop({ required: true })
    reducedHours!: number; // Reduced working hours

    @Prop({ required: true })
    effectiveFrom!: Date; // Start date

    @Prop()
    effectiveTo?: Date; // End date (optional)

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[];
}

export const ShortTimePolicySchema = SchemaFactory.createForClass(ShortTimePolicy);
