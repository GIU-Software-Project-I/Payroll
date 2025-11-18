// /database/os/department.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

export enum DepartmentStatus{
    ACTIVE="Active",
    INACTIVE="Inactive"
}

@Schema({ timestamps: true })
export class Department {
    // BR-5: unique ID for entities
    @Prop({ required: true, unique: true })
    departmentCode!: string; // e.g., DPT-ENG

    @Prop({ required: true, unique:true })
    name!: string;

    @Prop({ type: Types.ObjectId, ref: 'Department' })
    parentDepartment?: Types.ObjectId;
    // WHY: BR-24 - Enables hierarchical structure for graphical org chart
    // Supports multi-level department nesting (e.g., IT Dept → Software Dept)
    @Prop()
    description?: string;

    // BR-30: costCenter required for payroll linkage on creation
    @Prop({ required: true })
    costCenter?: string;

    // link to employee who is head of dept (nullable)
    @Prop({ type: Types.ObjectId, ref: 'Manager', default: null })
    headOfDepartment?: Types.ObjectId | null;

    // Soft-status: Active/Inactive (BR-16)
    @Prop({ enum: Object.values(DepartmentStatus), default: DepartmentStatus.ACTIVE})
    status?:DepartmentStatus;

    @Prop({ type: Date })
    deactivatedAt?: Date;// BR 37: Track deactivation date to preserve history

    @Prop({ type: Types.ObjectId, ref: 'HR' })
    deactivatedBy?:Types.ObjectId;

    // BR-22: Version history for audit compliance
    @Prop([{field: String, oldValue: String, newValue: String, changedBy: Types.ObjectId, ref:'HR',changedAt: Date,
    }])
    changeHistory?: Array<Record<string, any>>;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
