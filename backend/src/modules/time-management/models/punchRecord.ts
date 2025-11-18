import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

export enum CaptureVia {
    Biometric = 'Biometric',
    WebLogin = 'Web Login',
    MobileApp = 'Mobile App',
    ManualInput = 'Manual Input'
}

export enum PunchType {
    ClockIn = 'CLOCK IN',
    ClockOut = 'CLOCK OUT'
}

@Schema({ timestamps: true })
export class punchRecord {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;

    @Prop({ required: true })
    punchTime!: Date;

    @Prop({ enum: PunchType, required: true })
    punchType!: string;

    @Prop({ enum: CaptureVia, required: true })
    captureVia!: string;

    @Prop({ default: false })
    isManual!: boolean;

    @Prop()
    location?: string; // GPS coordinates or location name

    @Prop()
    deviceId?: string; // Specific device identifier

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[];
}

export const PunchRecordSchema = SchemaFactory.createForClass(punchRecord);