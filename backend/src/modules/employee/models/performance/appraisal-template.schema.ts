import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";


export enum TemplateType {
    ANNUAL = 'Annual',
    PROBATIONARY = 'Probationary',
    SEMI_ANNUAL = 'Semi-Annual',
}

export type AppraisalTemplateDocument = HydratedDocument<AppraisalTemplate>;

@Schema({ timestamps: true })
export class AppraisalTemplate {
 @Prop({ required: true })
name!: string; // Name of the template (REQ-PP-01)

 @Prop({ required: true, enum: Object.values(TemplateType) })
  type!: TemplateType; // e.g., Annual, Probationary, Semi-Annual (REQ-PP-01),


@Prop({ type: [String], required: true })
 ratingScales!: string[]; // Defined rating scales (e.g., Excellent, Good) (REQ-PP-01, BR 14)

@Prop({ type: [String], required: true })
evaluationCriteria?: string[]; // Criteria for scoring (REQ-PP-01)

    @Prop({ type: [Types.ObjectId], ref: 'Department', default: [] })
assignedDepartments?: Types.ObjectId[];
 //Which departments this template applies to (REQ-PP-01, Phase 1)

    @Prop({ default: true })
    active!: boolean;
    // WHY: Allows disabling deprecated templates without deleting them.
    // BR 37: Preserve historical templates.
 }

export const AppraisalTemplateSchema = SchemaFactory.createForClass(AppraisalTemplate);

