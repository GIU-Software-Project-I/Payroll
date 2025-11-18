import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

@Schema({ timestamps: true })
export class AttendanceCorrectionRequest {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'AttendanceRecord' })
    attendanceRecordId?: Types.ObjectId;

    @Prop({ required: true })
    requestDate!: Date;

    @Prop()
    requestedClockIn?: Date;

    @Prop()
    requestedClockOut?: Date;

    @Prop({ required: true })
    reason!: string;

    @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    status!: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    currentApprover!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop({type: [AuditTrail], default: []})
    auditTrail?: typeof AuditTrail[];
}
export const AttendanceCorrectionRequestSchema = SchemaFactory.createForClass(AttendanceCorrectionRequest);
