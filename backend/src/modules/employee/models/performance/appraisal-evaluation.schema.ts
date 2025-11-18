import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppraisalEvaluationDocument = AppraisalEvaluation & Document;

@Schema({ timestamps: true })
export class AppraisalEvaluation {
    @Prop({ type: Types.ObjectId, ref: 'AppraisalAssignment', required: true })
    assignmentId!: Types.ObjectId;
    // WHY: Ensures evaluation belongs to a specific assignment.
    // REQ-AE-03: Manager completes evaluation.

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;
    // WHY: Redundant but required for indexing & fast retrieval.

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    managerId!: Types.ObjectId;
    // WHY: Manager identity for audit + BR 22.

    @Prop({ type: Object, required: true })
    ratings!: Record<string, any>;
    // WHY: Key-value rating set (criterion → score).
    // REQ-AE-03.
    // BR 7(a), 8, 14, 21: Structured ratings.

    @Prop()
    comments?: string;
    // WHY: Manager support comments.
    // REQ-AE-04.
    // BR 26, 33(d): Comments required for context.

    @Prop()
    developmentNotes?: string;
    // WHY: Development recommendations.
    // REQ-AE-04.

    @Prop({ default: 'Draft', enum: ['Draft', 'Finalized'] })
    status!: string;
    // WHY: Manager may save progress before submitting.
    // Supports workflow.

    @Prop({ default: null })
    finalizedAt?: Date | null;
    // WHY: Used for publishing schedule + HR dashboards.

    @Prop({ type: Object })
    timeManagementData?: Record<string, any>;
    // WHY: Attendance/punctuality pulled from TM module.
    // Dependency: Time Management.
}

export const AppraisalEvaluationSchema = SchemaFactory.createForClass(AppraisalEvaluation);


//
//
//
//
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';
//
// export type AppraisalFeedbackDocument = AppraisalFeedback & Document;
//
// @Schema({ timestamps: true })
// export class AppraisalFeedback {
//     @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord', required: true })
//     recordId: Types.ObjectId; // Associated appraisal record
//
//     @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
//     employeeId: Types.ObjectId; // Employee receiving feedback
//
//     @Prop({ type: String, required: true })
//     comments: string; // Feedback provided by employee after review
//
//     @Prop({ default: null })
//     submittedAt: Date; // When feedback was submitted
// }
//
// export const AppraisalFeedbackSchema =
//     SchemaFactory.createForClass(AppraisalFeedback);


//
//
//
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';
//
// export type AppraisalArchiveDocument = AppraisalArchive & Document;
//
// @Schema({ timestamps: true })
// export class AppraisalArchive {
//     @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord', required: true })
//     recordId: Types.ObjectId; // Archived record reference
//
//     @Prop({ required: true })
//     archivedAt: Date; // Date of archiving
//
//     @Prop({ type: Object })
//     snapshot: Record<string, any>;
//     // Complete record snapshot for historical analysis
// }
//
// export const AppraisalArchiveSchema =
//     SchemaFactory.createForClass(AppraisalArchive);


