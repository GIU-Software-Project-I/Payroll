import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';

export type PayrollInitiationDocument = HydratedDocument<PayrollInitiation>;

export enum PayrollInitiationType {
    REGULAR='REGULAR',
    SIGNING_BONUS='SIGNING_BONUS',
}

export enum PayrollInitiationStatus {
    PENDING='PENDING',
    PROCESSING='PROCESSING',
    FAILED='FAILED',
}

@Schema({ timestamps: true })
export class PayrollInitiation {
    @Prop({ type: Types.ObjectId, ref: 'Onboarding', required: true })
    onboarding?: Types.ObjectId; // Reference to onboarding - ONB-018, ONB-019

    @Prop({ enum: PayrollInitiationType, required: true})
    initiationType?: PayrollInitiationType; // Type of payroll initiation - ONB-018, ONB-019

    @Prop()
    amount?: number; // For signing bonuses - ONB-019

    @Prop({ required: true })
    effectiveDate?: Date; // When payroll should start - ONB-018

    @Prop({ enum: PayrollInitiationType, default: PayrollInitiationStatus.PENDING})
    status?:PayrollInitiationStatus; // Processing status - ONB-018, ONB-019

    @Prop()
    processedAt?: Date; // When payroll was actually initiated - ONB-018

    @Prop()
    payrollReference?: string; // Reference from payroll system - REQ-PY-23, REQ-PY-27

    @Prop()
    errorMessage?: string; // If initiation failed - ONB-018, ONB-019
}

export const PayrollInitiationSchema = SchemaFactory.createForClass(PayrollInitiation);