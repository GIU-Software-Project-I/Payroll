// /database/os/position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PositionDocument = Position & Document;

export enum occupancyStatus{
    VACANT="Vacant",
    FILLED="Filled",
    FROZEN = 'Frozen',
    INACTIVE = 'Inactive',
}

export enum PositionStatus{
    ACTIVE ="Active",
INACTIVE="Frozen",
    FROZEN="Frozen"
}

@Schema({ timestamps: true })
export class Position {
    // BR-5 Unique identifier
    @Prop({ required: true, unique: true })
    positionCode!: string;

    @Prop({ required: true, unique: true })
    PositionTitle?: string;
    // e.g., POS-001
    // @Prop({ required: true, unique: true })
    jobTitle?: string;

    // BR-10: Job Key required (business identifier)
    @Prop({ required: true })
    jobKey!: string;

    // BR-10: department link required
    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId!: Types.ObjectId;

    // BR-10: payGrade required to validate with Payroll/Benefits
    @Prop({ required: true })
    payGrade?: string;

    // reporting line: reference to another position (can be null for top-level)
    @Prop({ type: Types.ObjectId, ref: 'Position', default: null })
    reportManager?: Types.ObjectId | null; // EMPLOYEE REFERENCE OR POSITION REFERENCE


    //
    // @Prop({ type: Types.ObjectId, ref: 'Position' })
    //     // Optional: For chain-of-command reporting
    // reportingManagerRef?: Position; /

    // BR-30: costCenter required at creation for payroll usage
    @Prop({ required: true })
    costCenter?: string;

    // wageType used by Payroll integration (e.g., salary/hourly)
    @Prop({ required: true })
    wageType?: string;

    // occupancy - Vacant / Filled
    @Prop({ enum: Object.values(occupancyStatus), default: occupancyStatus.VACANT }) //check for default value
    occupancyStatus?: string;

    // // optional link to the employee who fills it (EP integration)
    // @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
    // employeeId?: Types.ObjectId | null;

    // BR-16: position status includes Frozen/Inactive
    @Prop({ enum: Object.values(PositionStatus), default: PositionStatus.ACTIVE })
    status?: PositionStatus;

    // delimiting: when closed but history preserved (BR-12, BR-37)
    @Prop({ type: Date, default: null })
    validUntil?: Date | null; // BR 37 (Historical records must be preserved using delimiting)."????

    @Prop({ type: String })
    delimitedBy?: string;
    // WHY: BR-22 - Audit trail (user ID who delimited position)

    // BR-22: Version history for structural changes
    @Prop([{field: String, oldValue: String, newValue: String, changedBy: String, changedAt: Date, approvedBy: String,
    }])
    changeHistory?: Array<Record<string, any>>;
    // WHY: BR-22 - Audit logs for all updates (REQ-OSM-02)
    // Tracks reporting line changes (REQ-OSM-03/04)

}

export const PositionSchema = SchemaFactory.createForClass(Position);
