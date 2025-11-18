import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

export enum OvertimeType {
    Regular = 'Regular',
    Weekend = 'Weekend',
    Holiday = 'Holiday',
    Night = 'Night'
}
export enum calculationMethod {
    rate_multiplier = 'Rate multiplier',
    fixed_amount = 'Fixed amount'
}

@Schema({ timestamps: true })
export class OvertimePolicy {
    @Prop({ required: true })
    name!: string;

    @Prop({ type: OvertimeType, enum: Object.values(OvertimeType), required: true })
    overtimeTypes!: OvertimeType;

    @Prop({ type: calculationMethod, enum: Object.values(calculationMethod), required: true })
    calculationMethod!: calculationMethod;

    @Prop({ required: true })
    category!: string;

    @Prop({ min: 1 })
    rateMultiplier?: number;

    @Prop({ min: 0 })
    FixedAmount?: number;

    @Prop({ default: true })
    requiresApproval!: boolean;

    @Prop({ default: 0 })
    dailyCap?: number;

    @Prop({ default: 0 })
    weeklyCap?: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({type: [AuditTrail], default: []})
    auditTrail?: typeof AuditTrail[];
}

export const OvertimePolicySchema = SchemaFactory.createForClass(OvertimePolicy);