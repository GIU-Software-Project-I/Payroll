import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // NestJS Mongoose decorators
import mongoose, { HydratedDocument } from 'mongoose'; // Mongoose for ObjectId and document typing
import { EmployeeProfile as Employee } from '../../../employee/models/employee/employee-profile.schema';

// Type for a single penalty document
export type penaltyDocument = HydratedDocument<penalty>;

@Schema()
class penalty {
    @Prop({ required: true })
    reason: string; // Reason for the penalty (e.g., late submission, absence)

    @Prop({ required: true })
    amount: number; // Penalty amount
}

// Create Mongoose schema for penalty subdocument
const penaltySchema = SchemaFactory.createForClass(penalty);

// Type for employee penalties document
export type employeePenaltiesDocument = HydratedDocument<employeePenalties>;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt
export class employeePenalties {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    employeeId: mongoose.Types.ObjectId; // Reference to the employee

    @Prop({ type: [penaltySchema] })
    penalties?: penalty[]; // Array of penalties assigned to the employee
}

// Create Mongoose schema for employee penalties collection
export const employeePenaltiesSchema = SchemaFactory.createForClass(employeePenalties);