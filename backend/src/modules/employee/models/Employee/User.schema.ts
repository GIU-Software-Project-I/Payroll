import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';



export enum EmployeeStatus {
    ACTIVE = 'Active',
    ON_LEAVE = 'On Leave',
    SUSPENDED = 'Suspended',
    TERMINATED = 'Terminated',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // BR-22: createdAt & updatedAt for traceability
export class User {

    // PERSONAL DETAILS (BR 2a-r)
    @Prop({ required: true })
    firstName!: string; // captured at onboarding (Onboarding Module)

    @Prop({ required: true })
    lastName?: string;

    @Prop({required: true, unique: true, index: true, trim: true})
    passwordHash!: string; // hashed password for authentication

    @Prop()
    middleName?: string;

    @Prop({ required: true, unique: true })
    nationalId!: string; // used for legal/identity flows (US-E2-06)

    @Prop()
    dateOfBirth?: Date;

    @Prop()
    gender?: string;

    @Prop()
    maritalStatus?: string; // editable through change request (US-E2-06)

    // CONTACT (BR-2n, BR-2o, BR-2g)
    @Prop({required: true, match: [/^[0-9+()\-\s]{7,20}$/, 'Invalid phone format'] })// BR-2n
    phoneNumber?: string;

    @Prop({required: true, unique: true, index: true, lowercase: true, trim: true})// BR-2o
    email!: string;

    @Prop({type: {
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
        }, required: true,})
    address!: Record<string, any>; // BR-2g

    // EDUCATION (BR-3h)
    @Prop([{ institution: String, degree: String, yearOfCompletion: Number, major: String }])
    education?: Array<Record<string, any>>;

    // EMPLOYMENT INFORMATION
    @Prop({ required: true, enum: EmployeeStatus })
    employmentStatus!: EmployeeStatus; // Active|On Leave|Suspended|Terminated (BR-3j) - affects access & downstream flows

    @Prop({ required: true })
    dateOfHire!: Date; // BR-3b

    @Prop()
    contractType?: string; // BR-3f

    // ORGANIZATIONAL LINKS (BR-3d, BR-3e)
    @Prop({ type: Types.ObjectId, ref: 'Position' })
    position?: Types.ObjectId; // links to OS module; changes may trigger REQ-OSM workflows

    @Prop({ type: Types.ObjectId, ref: 'Manager' })
    supervisor?: Types.ObjectId; // direct manager; used to generate manager view (REQ-SANV-02)

    // PAY & COMPENSATION (BR-10c)
    @Prop({ required: true })
    payGrade!: string; // used by Payroll & Benefits downstream

    // PERFORMANCE (BR-16)
    @Prop([{ type: Types.ObjectId, ref: 'Appraisal' }])
    appraisals?: Types.ObjectId[]; // stores appraisal history references - satisfies saving appraisals on profile

    // PROFILE UI FIELDS (US-E2-12)
    @Prop()
    biography?: string; // short bio (self-service)

    @Prop()
    profilePictureUrl?: string; // URL to profile photo (self-service upload)


    // AUDIT TRAIL (BR-22) - additional structured trail besides timestamps
    @Prop([{timestamp: Date, changedBy: { type: Types.ObjectId, ref: 'HR' }, changeSummary: String,
    }])
    auditTrail?: Array<{ timestamp: Date; changedBy: Types.ObjectId; changeSummary: string }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
