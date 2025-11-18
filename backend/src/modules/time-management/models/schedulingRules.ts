import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {AuditTrail} from "./AuditTrail";

export type SchedulingRuleDocument = SchedulingRule & Document;

@Schema()
export class SchedulingRule {
    @Prop({
        required: true,
        enum: ['FlexTime', 'Rotational', 'CompressedWeek', 'CustomWeeklyPattern'],
    })
    type!: string;

    // FlexTime rule
    @Prop({
        type: {
            requiredHours: {type: Number, required: true},
            coreHours: {
                startTime: {type: String},
                endTime: {type: String},
            },
        },
    })
    flexTime?: {
        requiredHours: number;
        coreHours?: {
            startTime: string;
            endTime: string;
        };
    };

    // Rotational rule
    @Prop({
        type: {
            daysOn: {type: Number, required: true},
            daysOff: {type: Number, required: true},
        },
    })
    rotationalPattern?: {
        daysOn: number;
        daysOff: number;
    };

    // Compressed week rule
    @Prop({
        type: {
            workDays: {type: Number, required: true},
            offDays: {type: Number, required: true},
        },
    })
    compressedWeek?: {
        workDays: number;
        offDays: number;
    };

    // Custom weekly pattern rule
    @Prop({
        type: {
            pattern: [
                {
                    dayOfWeek: {type: String, required: true}, // Mon–Sun
                    status: {type: String, required: true},    // WorkDay | OffDay
                    requiredHours: {type: Number},
                },
            ],
            cycleLength: {type: Number, required: true},
        },
    })
    customWeeklyPattern?: {
        pattern: {
            dayOfWeek: string;
            status: string;
            requiredHours?: number;
        }[];
        cycleLength: number;
    };

    @Prop()
    effectiveFrom?: Date;

    @Prop()
    effectiveTo?: Date;

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[]; // Array of audit entries
}

export const SchedulingRuleSchema = SchemaFactory.createForClass(SchedulingRule);
