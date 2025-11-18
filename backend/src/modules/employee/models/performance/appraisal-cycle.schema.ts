





import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';


//(annual, semi-annual, probationary)

export enum AppricialCycleType{

    ANNAUAL="Annual",
    SEMI_ANNUAL="Semi annual",
    PROBATIONARY="Probationary",
}

export enum CycleStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    CLOSED = 'Closed',
    ARCHIVED = 'Archived',
}

export type AppraisalCycleDocument = HydratedDocument<AppraisalCycle>;

@Schema({ timestamps: true })
export class AppraisalCycle {
    @Prop({ required: true })
    name!: string; // e.g., "2025 Annual Review" (REQ-PP-02)

    @Prop({required:true,enum:Object.values(AppricialCycleType)})
    type!: AppricialCycleType;

    @Prop({ required: true })
    startDate!: Date; // Start of the cycle (REQ-PP-02)

    @Prop({ required: true })
    endDate!: Date; // End of the cycle (REQ-PP-02)

    @Prop({ type: [Types.ObjectId], ref: 'AppraisalTemplate', required: true })
    templatesId!: Types.ObjectId[]; // Templates assigned to this cycle (REQ-PP-02)

    @Prop({ type: [Types.ObjectId], ref: 'Employee', default: [] })
    assignedEmployees?: Types.ObjectId[];
    // Employee list for this cycle (REQ-PP-05)

    @Prop({ type: [Types.ObjectId], ref: 'Employee', default: [] })
    assignedManagers?: Types.ObjectId[];
    // Line Managers responsible for appraisal (REQ-PP-05)

   @Prop({ default: CycleStatus.DRAFT, enum: Object.values(CycleStatus) })
    status!: CycleStatus;

    @Prop()
    objectionWindowDays?: number;
    // BR-31 - Pre-set objection window duration
    // Justification: Number for configurable dispute period

    // @Prop({ type: [{ type: Types.ObjectId, ref: 'Department' }], default: [] })
    // targetDepartments!: Types.ObjectId[];
    // // WHY: REQ-PP-05 - Bulk assignment scope by department.
    // // TYPE: ObjectId[]; used by assignment job.
    //
    // @Prop({ type: [{ type: Types.ObjectId, ref: 'Position' }], default: [] })
    // targetPositions!: Types.ObjectId[];
    // // WHY: REQ-PP-05 - Scope
}

export const AppraisalCycleSchema = SchemaFactory.createForClass(AppraisalCycle);

