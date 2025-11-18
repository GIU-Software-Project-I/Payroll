import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {AuditTrail} from "./AuditTrail";


export enum OverShortTimeType {
    EarlyIn = "EarlyIn",
    LateOut = "LateOut",
    OutOfHours = "OutOfHours",
    Total = "Total",
}

export enum CalculationMethod {
    RateMultiplier = "RateMultiplier",
    FixedAmount = "FixedAmount",
}
export enum PermissionStatus {
    Accepted = "Accepted",
    Rejected = "Rejected"
}

export type PermissionPolicyDocument = PermissionPolicy & Document;

@Schema({ timestamps: true })
export class PermissionPolicy {
    @Prop({ required: true })
    name!: string;

    @Prop({ type: String, enum: Object.values(PermissionStatus), required: true })
    status!: PermissionStatus; // Over/Short time permission status

    @Prop()
    description?: string;

    @Prop({ type: String, enum: Object.values(OverShortTimeType), required: true })
    overShortTimeType!: OverShortTimeType;

    @Prop({ required: true })
    category!: string; // Organizational grouping

    @Prop({ type: String, enum: Object.values(CalculationMethod), required: true })
    calculationMethod!: CalculationMethod;

    @Prop({ default: true })
    requiresApproval!: boolean;

    @Prop({ default: 0 })
    dailyCap?: number;

    @Prop({ default: 0 })
    weeklyCap?: number;

    @Prop({ required: true })
    effectiveFrom!: Date;

    @Prop()
    effectiveTo?: Date;

    @Prop({type: [AuditTrail], default: []})
    auditTrail?: typeof AuditTrail[];
}

export const PermissionPolicySchema = SchemaFactory.createForClass(PermissionPolicy);
