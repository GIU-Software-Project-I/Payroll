import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';
import {CycleStatus} from "./appraisal-cycle.schema";

export type AppraisalAssignmentDocument = HydratedDocument<AppraisalAssignment>;

export enum AssignmentStatus {
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'InProgress',
    SUBMITTED = 'Submitted',
    PUBLISHED = 'Published',
    CLOSED = 'Closed',
}
@Schema({ timestamps: true })
export class AppraisalAssignment {
    @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
    cycleId!: Types.ObjectId;
    // WHY: Assignment belongs to a cycle.
    // REQ-PP-05: HR assigns appraisal forms in bulk.

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;
    // WHY: The person being evaluated.
    // Dependency: Employee Profile (EP) for employment status.

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    managerId!: Types.ObjectId;
    // WHY: Direct line manager performing evaluation.
    // Dependency: OS (reporting lines).
    // REQ-PP-13: Manager views assigned forms.

    @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
    templateId!: Types.ObjectId;
    // WHY: Assignment linked to template rules.
    // Ensures consistent evaluation.

    @Prop({ default:CycleStatus , enum: Object.values(CycleStatus) })
    status!: CycleStatus;
    // WHY: Tracks manager progress.
    // REQ-AE-06: HR monitors progress.
    // BR 22, 37(a): Tracking & audit requirements.

    @Prop({ type: Date, default: null })
    completedAt?: Date | null;
    // WHY: Used for deadlines + reminders.
    // Notifications triggered when overdue.
}

export const AppraisalAssignmentSchema = SchemaFactory.createForClass(AppraisalAssignment);
