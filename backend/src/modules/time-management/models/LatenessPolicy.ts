import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

@Schema({ timestamps: true })
export class LatenessPolicy {
    @Prop({
        required: true
    })
    name!: string;

    @Prop({
        required: true,
        min: 0
    })
    gracePeriod!: number;

    @Prop({
        type: [{
            minutesLate: {
                type: Number,
                required: true
            },
            penaltyType: {
                type: String,
                required: true
            },
            penaltyAmount: {
                type: Number,
                default: 0
            }
        }]
    })
    penaltyThresholds!: any[];

    @Prop({
        type: [{
            occurrences: {
                type: Number,
                required: true
            },
            timeframe: {
                type: String,
                required: true
            },
            action: {
                type: String,
                required: true
            }
        }]
    })
    escalationRules!: any[];

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    createdBy!: Types.ObjectId;

    @Prop({type: [AuditTrail], default: []})
    auditTrail?: typeof AuditTrail[];
}

export const LatenessPolicySchema = SchemaFactory.createForClass(LatenessPolicy);
