import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {AuditTrail} from "./AuditTrail"; // Corrected import for standalone schema

export enum AssignmentType {
    Individual = 'Individual',
    Department = 'Department',
    Position = 'Position'
}

export enum AssignmentStatus {
    Entered = 'Entered',
    Submitted = 'Submitted',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Postponed = 'Postponed',
    Cancelled = 'Cancelled',
    Expired = 'Expired'
}

export type ShiftAssignmentDocument = ShiftAssignment & Document;

@Schema({ timestamps: true }) // Added timestamps for automatic createdAt/updatedAt
export class ShiftAssignment {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) // References Employee Profile
    employeeId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Shift', required: true })
    shiftId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department' }) // References Organizational Structure
    departmentId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Position' }) // References Organizational Structure
    positionId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SchedulingRule' }) // References SchedulingRule for custom rules
    schedulingRuleId?: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(AssignmentStatus),
        required: true
    })
    status!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    assignedBy!: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(AssignmentType),
        required: true
    })
    assignmentType!: AssignmentType;

    @Prop({ required: true })
    startDate!: Date;

    @Prop({ required: true })
    endDate!: Date;

    @Prop()
    expiryDate?: Date;

    @Prop({ type: [AuditTrail], default: [] }) // Corrected reference to standalone AuditTrailEntry
    auditTrail?: AuditTrail[]; // Corrected type annotation
}

export const ShiftAssignmentSchema = SchemaFactory.createForClass(ShiftAssignment);