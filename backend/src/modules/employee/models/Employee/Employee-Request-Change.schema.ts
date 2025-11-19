import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types, Schema as MongooseSchema} from "mongoose";

export enum ChangeRequestStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',


}

export type EmployeeChangeRequestDocument = HydratedDocument<EmployeeChangeRequest>;

@Schema({ timestamps: true })
export class EmployeeChangeRequest {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employee!: Types.ObjectId; // target employee

    @Prop({ required: true })
    field!: string; // e.g., 'position', 'department', 'nationalId', 'maritalStatus'

    @Prop({ type: MongooseSchema.Types.Mixed })
    oldValue: any;

    @Prop({ type: MongooseSchema.Types.Mixed })
    newValue: any;

    @Prop({ type: String, enum: Object.values(ChangeRequestStatus), default: ChangeRequestStatus.PENDING })
    status?: ChangeRequestStatus; // BR-36 workflow enforced

    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    requestedBy!: Types.ObjectId; // who submitted the request (can be employee or manager)

    @Prop({ type: Types.ObjectId, ref: 'Manager' })
    reviewedBy?: Types.ObjectId; // HR/approver

    @Prop({type:Types.ObjectId, ref:'HR'})
    hrReviewer?: Types.ObjectId; // HR reviewer for compliance checks

    @Prop()
    reviewComment?: string;

    @Prop({ default: false })
    requiresOrgStructureReview?: boolean; // if true, will trigger OSM update flow
}


export const EmployeeChangeRequestSchema = SchemaFactory.createForClass(EmployeeChangeRequest);