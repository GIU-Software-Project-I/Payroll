// /database/os/structure-change-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StructureChangeRequestDocument = StructureChangeRequest & Document;

export enum StructureRequestStatus{

    PENDING="Pending",
    APPROVED="Approved",
    REJECTED="Rejected",
}

export enum ChangeRequestType {
    REPORTING_LINE = 'Reporting Line Change',
    POSITION_UPDATE = 'Position Update',
    DEPARTMENT_REASSIGNMENT = 'Department Reassignment',
}

@Schema({ timestamps: true })
export class StructureChangeRequest {
    @Prop({ required: true, unique: true })
    requestId!: string;
    // WHY: BR-5 - Unique identifier for tracking
    // Used in approval workflows and notifications

    // requester (manager or admin) — used to route/authorize — REQ-OSM-03
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    requestedBy!: Types.ObjectId;

    // types: PositionCreate/PositionUpdate/ReportingLineChange/PositionDelimit
    @Prop({ required: true,enum:Object.values(ChangeRequestType)})
    requestType?: ChangeRequestType; //ENUM FOR THE ABOVE??

    // target position (nullable for create requests)
    @Prop({ type: Types.ObjectId, ref: 'Position', default: null })
    targetPositionId?: Types.ObjectId | null; // IS IT TARGET POSITION OR DEPARTEMENT

    // for create: payload contains proposed position fields
    @Prop({ type: Object })
    payload?: Record<string, any>;


    @Prop({ type: Types.ObjectId, ref: 'Position' })
   PositionAffected?: boolean
    // WHY: REQ-OSM-03 - Specifies which position is being modified
    // Used for reporting line changes or position updates

    @Prop()
    DepartementAffected?: boolean;
    // WHY: Supports department reassignment requests
    // Enables cross-department structural changes

    @Prop({ type: Types.ObjectId, ref: 'Position' })
    affectedPositionId?: Types.ObjectId;
    // WHY: REQ-OSM-03 - Specifies which position is being modified
    // Used for reporting line changes or position updates

    @Prop({ type: Types.ObjectId, ref: 'Department' })
    affectedDepartmentId?: Types.ObjectId;
    // WHY: Supports department reassignment requests
    // Enables cross-department structural changes

    // validation notes produced by automated checks (e.g., circular reporting detection) — REQ-OSM-09
    @Prop()
    validationNotes?: string;

    // workflow status (BR-36) — must follow approval flow
    @Prop({ enum: StructureRequestStatus, default: StructureRequestStatus.PENDING  })
    status?: StructureRequestStatus;

    @Prop({ type: Types.ObjectId, ref: 'HR', default: null })
    reviewedBy?: Types.ObjectId | null;

    @Prop({ default: null })
    reviewedAt?: Date | null;

    @Prop({ type: Types.ObjectId, ref: 'HR', default: null })
    ApprovedBy?: Types.ObjectId | null;

    @Prop({ default: null })
    ApprovedAt?: Date | null;

    @Prop()
    comments?: string;

    // @Prop({ type: Types.ObjectId, ref: 'Position' })
    //     // Optional: New reporting manager proposed
    // newReportingManager?: Types.ObjectId;
}

export const StructureChangeRequestSchema = SchemaFactory.createForClass(StructureChangeRequest);
