import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.schema';
import {Roles} from "./User-Role";

@Schema()
export class HR extends User {
    // US-E7-05: HR-specific permissions for full employee lifecycle management
    // HR can onboard, offboard, manage all employee records, override certain validations
    @Prop([String])
    specialPermissions?: string[];

    // // BR-20a: Track HR case assignments (grievances, disciplinary actions, investigations)
    // @Prop([{ type: Types.ObjectId, ref: 'HRCase' }])
    // assignedCases?: Types.ObjectId[];

    // REQ-SANV: HR manages onboarding workflows - track active onboarding sessions
    @Prop([{ type: Types.ObjectId, ref: 'OnboardingSession' }])
    activeOnboardings?: Types.ObjectId[];

    // BR-10c: HR oversees compensation/payroll - track pending salary adjustments
    @Prop([{ type: Types.ObjectId, ref: 'SalaryAdjustment' }])
    pendingSalaryAdjustments?: Types.ObjectId[];

    // BR-22: HR generates compliance/audit reports - track report generation history
    @Prop([{reportType: String, generatedAt: Date, reportUrl: String,}])
    generatedReports?: Array<Record<string, any>>;

    // US-E2-06 & BR-20a: Track all requests assigned to HR for processing
    // Includes: leave requests, change requests, document requests, etc.
    @Prop([{ type: Types.ObjectId, ref: 'EmployeeChangeRequest' }])
    assignedRequests?: Types.ObjectId[];

    // ROLES & ACCESS (US-E7-05, BR-20a)
    @Prop({type: String, enum: Object.values(Roles), index: true})
    roles!: Roles; // used for RBAC, e.g., EMPLOYEE, MANAGER, HR, SYS_ADMIN

    //Data Flow: Notification N-040 (Profile change request submitted) sent to HR/Manager.


}

export const HRSchema = SchemaFactory.createForClass(HR);
