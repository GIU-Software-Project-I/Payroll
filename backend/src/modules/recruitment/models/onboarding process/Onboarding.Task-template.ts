import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';


export enum AssignedToRole{

    HR='HR',
    IT='IT',
    ADMIN='ADMIN',
    NEW_HIRE='NEW_HIRE',
    PAYROLL='PAYROLL',
}

export enum TemplateCategory{

    DOCUMENT='DOCUMENT',
    SYSTEM_ACCESSED='SYSTEM_ACCESSED',
    RESORCE_RESERVATION='RESORCE_RESERVATION',
    PAYROLL_SETUP='PAYROLL SETUP',
    TRANING='TRANING',
    COMPILANCE='COMPILANCE',

}

export type OnboardingTaskDocument = HydratedDocument<OnboardingTask>;

@Schema({ timestamps: true })
export class OnboardingTask {
    @Prop({ required: true })
    title!: string; // Task title - ONB-001

    @Prop()
    description!: string; // Task details - ONB-001

    @Prop({ enum: AssignedToRole, required: true})
    assignedToRole?:AssignedToRole; // Who is responsible - ONB-001, BR 9(a,b,c)

    @Prop({ type: Types.ObjectId, ref: 'Department' })
    department?: Types.ObjectId; // Department-specific tasks - BR 11(b)

    @Prop({ enum: [], required: true})
    category?: TemplateCategory; // Task category for organization - ONB-004

    @Prop({ default: true })
    isMandatory?: boolean; // Whether task is required - BR 7, BR 11(a)

    @Prop()
    dueDaysOffset?: number; // Days before/after start date task is due - ONB-005

    @Prop()
    instructions?: string; // Detailed instructions for completion - ONB-004

    @Prop({ default: true })
    isActive?: boolean; // Allows deactivating old templates - ONB-001

    @Prop([{documentType: String, isRequired: Boolean, description: String}])
    requiredDocuments?: Array<{ documentType: string; isRequired: boolean; description: string; }>; // For document upload tasks - ONB-007, BR 7
}

export const OnboardingTaskSchema = SchemaFactory.createForClass(OnboardingTask);