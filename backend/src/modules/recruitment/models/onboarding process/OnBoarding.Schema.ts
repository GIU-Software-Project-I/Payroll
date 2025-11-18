import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {type} from "node:os";

export type OnboardingProcessDocument = HydratedDocument<OnboardingProcess>;


export enum TaskStatus{
    PENDING='pending',
    IN_PROGRESS='in_progress',
    COMPLETED='completed',
    FAILED='failed',
}

export enum OnboardingStatus{
    PENDING='pending',
    IN_PROGRESS='in_progress',
    COMPLETED='completed',
    CANCELLED='cancelled',
}

@Schema({ timestamps: true })
export class OnboardingProcess {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: false })
    employeeId!: Types.ObjectId;
    // Why: ONB-002 - Link to employee profile once created
    // Justification: Reference to Employee schema (to be created in Employee Profile module)
    // Optional initially as employee profile might be created later in the process

    @Prop({ type: Types.ObjectId, ref: 'RecruitmentOffer', required: true })
    offer!: Types.ObjectId; // Reference to accepted offer - ONB-002, BR 17(a,b)

    @Prop({ required: true })
    candidateName!: string;
    // Why: ONB-004 - New hire identification in tracker
    // Justification: Store candidate name until employee profile is created

    @Prop({ required: true })
    email!: string;
    //Why: ONB-009 - System access provisioning
    //Justification: Required for notifications and system account creation

    @Prop({ type: Types.ObjectId, ref: 'OnboardingChecklist', required: true })
    checklistId!: Types.ObjectId;
    // Why: ONB-001, ONB-004 - Reference to the checklist template
    // Justification: Populate to get checklist details for the tracker

    @Prop({ required: true })
    startDate?: Date;
    // Why: ONB-013, ONB-018 - Automated provisioning and payroll initiation timing
    // Justification: Critical for scheduling tasks and system access activation

    @Prop({type: String, enum: Object.values(OnboardingStatus), default: OnboardingStatus.PENDING})
    status?: string;
    // Why: ONB-004 - Track progress in onboarding tracker
    // Justification: Essential for monitoring overall process status


@Prop({type:Types.ObjectId, ref: 'OnboardingTask', required: true})
    tasks!: Types.ObjectId;

    // Why: ONB-004 - Individual task tracking in the onboarding tracker
    // Justification: Embedded sub-document for instance-specific task data
    // This denormalization supports efficient querying for the tracker without population

    // @Prop({ type: Types.ObjectId, ref: 'Contract' })
    // contractId!: Types.ObjectId;
    // // Why: ONB-002 - Access signed contract details for employee profile creation
    // // Justification: Reference to Contract schema (from Recruitment module)

    @Prop({ default: Date.now })
    contractSignedDate?: Date;
    // Why: ONB-018 - Payroll initiation timing based on contract signing
    // Justification: Critical for payroll cycle calculations

    @Prop({type: Types.ObjectId, ref: 'Position'} )
    position!:Types.ObjectId;
    // Why: ONB-009, ONB-012 - Department and role-based provisioning
    // Justification: Required for appropriate system access and equipment allocation
}

export const OnboardingProcessSchema = SchemaFactory.createForClass(OnboardingProcess);

