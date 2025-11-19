
// clearance-instance.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * ClearanceInstance (EmployeeClearance)
 * - Per-employee instance of a clearance workflow, created from a ClearanceChecklistTemplate.
 * - US: OFF-006 (offboarding checklist active), OFF-010 (multi-department exit sign-offs)
 * - BR: BR 13(b,c) (multi-department clearance required), BR 14 (final approval signature filed)
 *
 * Notes:
 * - This document stores a snapshot of the checklist items and tracks department sign-offs, statuses and timestamps.
 * - Each department sign-off is stored as an embedded array of objects, but department sign-offs can also be stored in a separate collection (see ClearanceDepartmentSignoff schema) for cross-team queries and to prevent large arrays.
 */

export type ClearanceInstanceDocument = ClearanceInstance & Document & { _id: Types.ObjectId };

export enum ClearanceStatus {
    IN_PROGRESS = 'in_progress',
    PARTIALLY_CLEARED = 'partially_cleared',
    FULLY_CLEARED = 'fully_cleared',
    BLOCKED = 'blocked',
    CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class ClearanceInstance {
    @Prop({
        type: Types.ObjectId,
        ref: 'OffboardingRequest',
        required: true,
    })
        /* why: Links the clearance to the initiating offboarding request (Step 1 -> Step 4). */
    offboardingRequestId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Employee',
        required: true,
    })
        /* why: Quick link to employee profile for clearance operations (Input: Employee Profile). */
    employeeId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'ClearanceChecklistTemplate',
        required: true,
    })
        /* why: Original template reference used to create this instance (traceability). */
    templateId!: Types.ObjectId;

    @Prop({
        type: [
            {
                itemCode: { type: String, required: true }, // e.g., IT_LAPTOP
                title: { type: String, required: true },
                department: { type: String, required: true },
                required: { type: Boolean, default: true },
                status: { type: String, enum: ['pending', 'returned', 'signed_off', 'not_applicable'], default: 'pending' },
                notes: { type: String, required: false },
                updatedBy: { type: Types.ObjectId, ref: 'User', required: false },
                updatedAt: { type: Date, required: false },
                // optionally link to AssetReturnRecord when an asset is returned
                assetReturnId: { type: Types.ObjectId, ref: 'AssetReturnRecord', required: false },
            },
        ],
        default: [],
    })
        /* why: Snapshot of checklist items at time of clearance creation (OFF-006). */
    items!: {
        itemCode: string;
        title: string;
        department: string;
        required?: boolean;
        status?: string;
        notes?: string;
        updatedBy?: Types.ObjectId;
        updatedAt?: Date;
        assetReturnId?: Types.ObjectId;
    }[];

    @Prop({
        type: [
            {
                department: { type: String, required: true }, // e.g., IT, Finance, Facilities, LineManager
                signoffStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
                signedBy: { type: Types.ObjectId, ref: 'User', required: false },
                signedAt: { type: Date, required: false },
                comment: { type: String, required: false },
            },
        ],
        default: [],
    })
        /* why: Multi-department sign-offs (OFF-010) must be tracked (BR 13b,c). */
    departmentSignoffs!: {
        department: string;
        signoffStatus?: 'pending' | 'approved' | 'rejected';
        signedBy?: Types.ObjectId;
        signedAt?: Date;
        comment?: string;
    }[];

    @Prop({
        enum: ClearanceStatus,
        default: ClearanceStatus.IN_PROGRESS,
    })
        /* why: Overall clearance lifecycle (OFF-010 governs final payroll release). */
    status!: ClearanceStatus;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
    })
        /* why: HR manager or owner responsible for this clearance instance. */
    ownerId?: Types.ObjectId;

    @Prop({
        type: [
            {
                actorId: { type: Types.ObjectId, ref: 'User' },
                action: { type: String },
                comment: { type: String },
                timestamp: { type: Date, default: () => new Date() },
            },
        ],
        default: [],
    })
        /* why: Audit trail for the clearance instance changes (BR 17). */
    auditTrail!: {
        actorId?: Types.ObjectId;
        action?: string;
        comment?: string;
        timestamp?: Date;
    }[];

    @Prop({ type: Date })
        /* why: Optional timestamp when the clearance became fully cleared (used to trigger payroll release). */
    clearedAt?: Date;
}

export const ClearanceInstanceSchema = SchemaFactory.createForClass(ClearanceInstance);
