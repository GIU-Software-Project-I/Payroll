import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';

export enum DocumentStatus {
    PENDING="PENDING",
    VERIFIED="VERIFIED",
REJECTED="Rejected",
}

export type OnboardingDocumentUploadDocument = HydratedDocument<OnboardingDocumentUpload>;

@Schema({ timestamps: true })
export class OnboardingDocumentUpload {
    @Prop({ type: Types.ObjectId, ref: 'Onboarding', required: true })
    onboarding!: Types.ObjectId; // Reference to onboarding process - ONB-007

    @Prop({ required: true })
    documentType?: string; // e.g., 'id', 'contract', 'certification' - ONB-007

    @Prop({ required: true })
    fileName!: string; // Original file name - ONB-007

    @Prop({ required: true })
    fileUrl?: string; // Path to stored file - ONB-007

    @Prop({ required: true })
    mimeType?: string; // File type for validation - ONB-007

    @Prop({ enum:DocumentStatus, default: DocumentStatus.PENDING})
    verificationStatus!:DocumentStatus; // Tracks HR verification - BR 7

    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    verifiedBy?: Types.ObjectId; // HR employee who verified - BR 7

    @Prop()
    verifiedAt?: Date; // When document was verified - BR 7

    @Prop()
    rejectionReason?: string; // If document was rejected - BR 7

    @Prop({ default: false })
    isSignedContract?: boolean; // Marks if this is the signed contract for profile creation - ONB-002

    @Prop()
    notes?: string;
    // Why: Service logic - Additional context for verification or rejection
    // Justification: Supports HR workflow and communication
}

export const OnboardingDocumentUploadSchema = SchemaFactory.createForClass(OnboardingDocumentUpload);