// clearance-department-signoff.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * ClearanceDepartmentSignoff
 * - Optional separate collection to hold department sign-offs.
 * - US: OFF-010 (multi-department sign-offs).
 * - BR: BR 13(b,c)
 *
 * Notes:
 * - This schema is provided because high-volume scenarios or auditing requirements may make querying signoffs across many clearances more efficient if stored as a separate collection.
 * - In ClearanceInstance we included embedded signoffs; choose one approach in your deployment. If you keep both, maintain data consistency by writing to both (or use eventual consistency + reconcile job).
 */

export type ClearanceDepartmentSignoffDocument = ClearanceDepartmentSignoff & Document & { _id: Types.ObjectId };

export enum DepartmentSignoffStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class ClearanceDepartmentSignoff {
    @Prop({ type: Types.ObjectId, ref: 'ClearanceInstance', required: true })
        /* why: Link to the ClearanceInstance for audit and traceability (OFF-010). */
    clearanceInstanceId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
        /* why: Employee link for departmental dashboards (who is being cleared). */
    employeeId!: Types.ObjectId;

    @Prop({ required: true })
        /* why: Department name (IT, Finance, Facilities, LineManager). */
    department!: string;

    @Prop({ enum: DepartmentSignoffStatus, default: DepartmentSignoffStatus.PENDING })
        /* why: Current state of sign-off (OFF-010). */
    signoffStatus!: DepartmentSignoffStatus;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
        /* why: Person who approved or rejected. */
    signedBy?: Types.ObjectId;

    @Prop({ type: Date, required: false })
        /* why: Timestamp of sign-off action. */
    signedAt?: Date;

    @Prop({ type: String, required: false })
        /* why: Optional comment from department during sign-off. */
    comment?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
        /* why: The user who created this signoff record (usually system/HR when instance created). */
    createdBy!: Types.ObjectId;
}

export const ClearanceDepartmentSignoffSchema = SchemaFactory.createForClass(ClearanceDepartmentSignoff);