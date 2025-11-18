import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

import { Document } from 'mongoose';
import {AuditTrail} from "./AuditTrail";

export enum shiftType {
    Normal = 'Normal',
    Split = 'Split',
    Overnight = 'Overnight',
    Rotational = 'Rotational',
    Mission = 'Mission'
}
export enum shiftName {
    FixedCoreHours = 'Fixed Core Hours',
    FlexTime = 'Flex-Time',
    Rotational = 'Rotational',
    Split = 'Split',
    CustomWeeklyPatterns = 'Custom Weekly Patterns',
    Overtime = 'Overtime'
}


@Schema({ timestamps: true })
export class Shift extends Document {
    @Prop({
        type: String,
        required: true
    })
    _id!:string;
    @Prop({
        type: String,
        enum: Object.values(shiftType),
        required: true
    })
    type!: shiftType;

    @Prop({ required: true, trim: true })
    name!: shiftName;
    @Prop({
        type: String,
        validate: {
            validator: (v: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'startTime must be in HH:MM format'
        }
    })
    startTime?: string;

    @Prop({
        type: String,
        validate: {
            validator: (v: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'endTime must be in HH:MM format'
        }
    })
    endTime?: string;


    @Prop({ default: false })
    isactive?: boolean;

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[]; // Array of audit entries
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);