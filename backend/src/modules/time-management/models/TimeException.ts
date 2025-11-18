import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

@Schema({ timestamps: true })
export class TimeException {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;

    @Prop({ required: true })
    exceptionType!: string; // Step 13: "time-related requests (corrections, overtime, permissions)"

    @Prop({ required: true })
    date!: Date;

    @Prop()
    startTime?: Date;

    @Prop()
    endTime?: Date;

    @Prop()
    duration!: number; // hours

    @Prop({ required: true })
    reason!: string;

    @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    status!: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    approvedBy!: Types.ObjectId;

    @Prop({type: [AuditTrail], default: []})
    auditTrail?: typeof AuditTrail[];
}

export const TimeExceptionSchema = SchemaFactory.createForClass(TimeException);
