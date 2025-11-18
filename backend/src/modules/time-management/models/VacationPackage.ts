import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import {AuditTrail} from "./AuditTrail";

@Schema({ timestamps: true })
export class VacationPackage {
    @Prop({ required: true })
    name!: string; // e.g., "Standard Annual Leave", "Executive Package"

    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    employeeId?: Types.ObjectId; // Optional: for personalized packages

    @Prop({ required: true })
    annualEntitlement!: number; // Total days per year

    @Prop({ required: true })
    accrualRate!: number; // Days per month (e.g., 2.5 days/month)

    @Prop({ required: true })
    maxCarryOver!: number; // Maximum days that can carry to next year

    @Prop({ required: true })
    validityPeriod!: number; // Months (e.g., 12 for annual)

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId; // HR Manager - Step 15

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[];
}

export const VacationPackageSchema = SchemaFactory.createForClass(VacationPackage);