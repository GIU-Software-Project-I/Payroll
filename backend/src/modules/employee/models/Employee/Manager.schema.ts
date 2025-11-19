import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.schema';
import {Roles} from "./User-Role";

@Schema()
export class Manager extends User {
    // REQ-SANV-02: List of direct reports for manager dashboard
    // Managers need to view/manage their team members' data, appraisals, leave requests
    @Prop([{ type: Types.ObjectId, ref: 'Employee' }])
    directReports?: Types.ObjectId[];

    // BR-3e: Managers also report to higher-level managers (chain of command)
    @Prop({ type: Types.ObjectId, ref: 'Manager' })
    supervisor?: Types.ObjectId;

    // US-M1-01: Track approval delegation when manager is unavailable
    // Allows temporary delegation of approval authority during leave/absence
    @Prop({ type: Types.ObjectId, ref: 'Manager' })
    delegatedApprover?: Types.ObjectId;

    // BR-16: Managers conduct appraisals - track pending appraisals assigned to them
    @Prop([{ type: Types.ObjectId, ref: 'Appraisal' }])
    pendingAppraisals?: Types.ObjectId[];

    // ROLES & ACCESS (US-E7-05, BR-20a)
    @Prop({type: String, enum: Object.values(Roles), index: true})
    roles!: Roles.LINE_MANAGER; // used for RBAC, e.g., EMPLOYEE, MANAGER, HR, SYS_ADMIN
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
