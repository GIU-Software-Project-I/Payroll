
// final-settlement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * FinalSettlement (FinalSettlementRecord)
 * - Stores summary and details of the employee's final pay, deductions and benefits termination (OFF-013).
 * - BR: BR 9, BR 11 (Leaves balance review and benefits termination)
 *
 * Notes:
 * - Kept as separate collection for auditability and to simplify payroll integration.
 * - Settlement records may be consumed by Payroll Module to produce a final payslip or encashment.
 */

export type FinalSettlementDocument = FinalSettlement & Document & { _id: Types.ObjectId };

export enum SettlementStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    PROCESSED = 'processed',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class FinalSettlement {
    @Prop({ type: Types.ObjectId, ref: 'OffboardingRequest', required: true })
        //Link to the initiating request to maintain full traceability (OFF-013).

    offboardingRequestId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
        // Employee identification (for payroll, benefits termination)

    employeeId!: Types.ObjectId;

    @Prop({ type: Number, required: true })
        // Gross final payouts (sum before deductions).
    grossAmount!: number;

    @Prop({ type: Number, required: true })
        // why: Sum of deductions applicable (loans, penalties).
    totalDeductions!: number;

    @Prop({ type: Number, required: true })
        //why: Net payable amount after deductions (used by Payroll integration).

    netPayable!: number;

    @Prop({
        type: [
            {
                code: { type: String, required: true }, // e.g., "UNUSED_ANNUAL_ENCASHMENT"
                description: { type: String, required: false },
                amount: { type: Number, required: true },
            },
        ],
        default: [],
    })
        /* why: Breakdown of settlement line-items (BR 9: unused leave encashment, loans, severance). */
    breakdown!: {
        code: string;
        description?: string;
        amount: number;
    }[];

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
        /* why: HR actor who prepared the settlement. */
    preparedBy!: Types.ObjectId;

    @Prop({ enum: SettlementStatus, default: SettlementStatus.DRAFT })
        /* why: Status of settlement lifecycle (preparation -> approval -> processed). */
    status!: SettlementStatus;

    @Prop({ type: Types.ObjectId, ref: 'User' })
        /* why: Approver (Finance / HR) who signed off on settlement. */
    approvedBy?: Types.ObjectId;

    @Prop({ type: Date })
        /* why: Timestamp of approval. */
    approvedAt?: Date;

    @Prop({ type: String, required: false })
        /* why: Notes about settlement calculations, rounding rules or exceptions. */
    notes?: string;

    @Prop({ type: Boolean, default: false })
        /* why: Indicates whether benefits termination notification has been sent (OFF-013). */
    benefitsNotified!: boolean;
}

export const FinalSettlementSchema = SchemaFactory.createForClass(FinalSettlement);