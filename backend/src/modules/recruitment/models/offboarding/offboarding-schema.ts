// offboarding-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * OffboardingRequest
 * - Represents the initiation of a resignation or termination review.
 * - US: OFF-001 (HR-initiated termination review), OFF-018 (Employee resignation request), OFF-019 (track resignation status)
 * - BR: BR 4 (effective date + reason), BR 6 (resignation allowed)
 *
 * Notes:
 * - This is the primary record that starts the Offboarding workflows and links to ClearanceInstance(s), FinalSettlement, and AccessRevocation logs.
 * - Keeping a separate collection ensures auditability of the initiation event (vs. clearance/signoffs).
 */

export type OffboardingRequestDocument = OffboardingRequest & Document & { _id: Types.ObjectId };

export enum OffboardingType {
    RESIGNATION = 'resignation',
    TERMINATION = 'termination',
    RETIREMENT = 'retirement',
    CONTRACT_END = 'contract_end',
}

export enum OffboardingStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class OffboardingRequest {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Employee',
    })
        /* why: Required to link request to the Employee Profile (Inputs needed: Employee Profile). (US: OFF-018, OFF-001) */
    employeeId!: Types.ObjectId;

    @Prop({
        enum: OffboardingType,
        required: true,
    })
        /* why: Identifies if the request is resignation or termination etc (BR 4, BR 6). */
    type!: OffboardingType;

    @Prop({ required: true })
        /* why: Business rule BR 4 mandates a clearly stated reason for exit. */
    reason!: string;

    @Prop({ type: Date, required: true })
        /* why: BR 4 requires an effective date for separation. */
    effectiveDate!: Date;

    @Prop({
        enum: OffboardingStatus,
        default: OffboardingStatus.PENDING_APPROVAL,
        required: true,
    })
        /* why: Must track the request lifecycle to support OFF-019 (employee tracking) and downstream flows. */
    status!: OffboardingStatus;

    @Prop({
        type: [
            {
                actorId: { type: Types.ObjectId, ref: 'User' }, // person who performed action
                action: { type: String }, // e.g., 'submitted','escalated','approved','rejected'
                comment: { type: String },
                timestamp: { type: Date, default: () => new Date() },
            },
        ],
        default: [],
    })
        /* why: Audit trail for all actions on this request (BR 17: logging required). */
    auditTrail!: {
        actorId?: Types.ObjectId;
        action?: string;
        comment?: string;
        timestamp?: Date;
    }[];

    @Prop({
        type: Types.ObjectId,
        ref: 'ClearanceInstance',
        required: false,
    })
        /* why: Reference to the active ClearanceInstance (OFF-006, OFF-010) created after approval/initiation. */
    clearanceInstanceId?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'FinalSettlement',
        required: false,
    })
        /* why: Links to FinalSettlementRecord that will be generated/triggered (OFF-013). */
    finalSettlementId?: Types.ObjectId;

    @Prop({
        type: Boolean,
        default: false,
    })
        /* why: Quick boolean for whether notification to Payroll/Benefits has been fired (OFF-013). */
    payrollNotified!: boolean;

    @Prop({
        type: String,
        required: false,
    })
        /* why: Optional field to capture manager or HR comments during initiation. */
    initiatorComment?: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
        /* why: Tracks who created/initiated the request (employee or HR actor). */
    createdBy!: Types.ObjectId;

    @Prop({
        type: Date,
        required: false,
    })
        /* why: Optional date when separation was completed (for lifecycle tracking). */
    completedAt?: Date;
}

export const OffboardingRequestSchema = SchemaFactory.createForClass(OffboardingRequest);