// schemas/system-access-provisioning.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';


export enum SystemType{
    EMAIL='Email',
    PAYROLL_SYSTEM='Payroll System',
    INTERNAL_SYSTEM='Internal System',
    SSO='SSO',
    TOOLS='Tools',
}

export enum SystemAccessStatus{

    PENDING='Pending',
    PROVISIONED='Provisioned',
    FAILED='Failed',
    SCHEDULED='Scheduled',
}

export type SystemAccessProvisioningDocument = HydratedDocument<SystemAccessProvisioning>;

@Schema({ timestamps: true })
export class SystemAccessProvisioning {
    @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
    onboardingProcessId!: Types.ObjectId;
    // Why: ONB-009, ONB-013 - Link provisioning to specific onboarding process
    // Justification: Required for tracking system access per new hire

    @Prop({ enum: Object.values(SystemType), required: true})
    systemType!:SystemType// Type of system access - ONB-009, BR 9(b)// OR STRING FOR FLEXIBILITY

    @Prop({ enum: Object.values(SystemAccessStatus), default: SystemAccessStatus.PENDING})
    status!: SystemAccessStatus;
    // Why: ONB-009, ONB-013 - Track provisioning workflow
    // Justification: Essential for IT workflow monitoring

    @Prop()
    scheduledAt?: Date;
    // Why: ONB-013 - Automated provisioning on start date
    // Justification: Critical for timing access activation

    @Prop()
    provisionedAt?: Date;
    // Why: ONB-013 - Audit trail for access provisioning
    // Justification: Compliance and security requirement

    @Prop({ type: Types.ObjectId, ref: 'HR' })
    provisionedBy?: Types.ObjectId; // System admin who provisioned - ONB-009


@Prop({ required: true })
accountIdentifier?: string; // Username/email for the account - ONB-009, make it array

@Prop()
scheduledRevocationDate?: Date; // For automatic revocation - ONB-013, BR 20

@Prop()
revokedAt?: Date; // When access was actually revoked - ONB-013


}

export const SystemAccessProvisioningSchema = SchemaFactory.createForClass(SystemAccessProvisioning);





