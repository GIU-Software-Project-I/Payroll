import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {AuditTrail} from "./AuditTrail";
import {punchRecord} from "./punchRecord";
import {VacationPackage} from "./VacationPackage";


@Schema()
export class attendanceRecord {
    @Prop()
    ceratedAt!: Date;

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId; // From Employee Profile

    @Prop({ required: true })
    date!: Date;

    @Prop({ type: Types.ObjectId, ref: 'ShiftAssignment' })
    shiftAssignmentId!: Types.ObjectId;

    @Prop()
    scheduledStart?: Date;

    @Prop()
    scheduledEnd?: Date;

    @Prop([{ type: Types.ObjectId, ref: 'punchRecord' }])
    punchRecordIds!: Types.ObjectId[]; // Array of references

    @Prop()
    totalHours!: number;

    @Prop({ default: 0 })
    lateMinutes!: number;

    @Prop({ default: 0 })
    overtimeMinutes!: number;

    @Prop({
        enum: ['Present', 'Absent', 'Late', 'Half-Day', 'On-Leave'],
        default: 'Absent'
    })
    status!: string;

    @Prop({
        enum: ['FirstInLastOut', 'MultipleEntries'],
        default: 'FirstInLastOut'
    })
    punchMode!: string;

    @Prop()
    location?: string; // For location tracking

    @Prop({ default: false })
    hasMissingPunches!: boolean;

    @Prop({ default: false })
    isOvertime?: boolean; // Optional flag for overtime

    @Prop({ default: false })
    isLateness?: boolean; // Optional flag for lateness

    @Prop({ default: false })
    requiresCorrection!: boolean;

    @Prop()
    vacationPackage?: VacationPackage;

    @Prop({
        required: true,
        enum: ['NearestInterval', 'Ceiling', 'Floor', 'Alignment', 'FirstInLastOut'],
    })
    roundingRule!: string; // HR rounding rule

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[]; // Array of audit entries

}

export const AttendanceRecordSchema = SchemaFactory.createForClass(attendanceRecord);