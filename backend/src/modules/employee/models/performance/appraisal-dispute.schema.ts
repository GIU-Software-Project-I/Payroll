import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';


export enum DisputeStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export type AppraisalDisputeDocument = HydratedDocument<AppraisalDispute>;

@Schema({ timestamps: true })
export class AppraisalDispute {
    @Prop({ type: Types.ObjectId, ref: 'AppraisalEvaluation', required: true })
    evaluationId!: Types.ObjectId;
    // WHY: Dispute is tied to a specific evaluation result.
    // REQ-AE-07.

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    raisedBy!: Types.ObjectId;
    // WHY: Employee who objects.
    // REQ-AE-07.
    // BR 31: Objection window rights.

    @Prop({ required: true })
    reason?: string;
    // WHY: Capture objection rationale.

    @Prop({ default: DisputeStatus.PENDING, enum: Object.values(DisputeStatus) })
    status!: DisputeStatus;
    // WHY: HR workflow for dispute resolution.
    // REQ-OD-07.
    // BR 31, 32 required logging.

    @Prop()
    hrDecision?: string;
    // WHY: Final HR resolution stored for audit.

    @Prop()
    hrComments?: string;
    // WHY: HR’s justification.

    @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
    resolvedBy?: Types.ObjectId | null;
    // WHY: Identifies HR Manager resolving the dispute.

    @Prop({ type: Date, default: null })
    resolvedAt?: Date | null;
    // WHY: Time-based appeal metrics.
}

export const AppraisalDisputeSchema = SchemaFactory.createForClass(AppraisalDispute);

















