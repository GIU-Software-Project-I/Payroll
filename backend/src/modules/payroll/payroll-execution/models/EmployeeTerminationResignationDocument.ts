import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // NestJS Mongoose decorators
import mongoose, { HydratedDocument } from 'mongoose'; // Mongoose for ObjectId and document typing
import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';
import { EmployeeProfile as Employee } from '../../../employee/models/employee/employee-profile.schema';
import { TerminationRequest } from '../../../recruitment/models/termination-request.schema';
import { BenefitStatus } from '../enums/payroll-execution-enum';

// Type for a Mongoose document of EmployeeTerminationResignationnn
export type EmployeeTerminationResignationDocument = HydratedDocument<EmployeeTerminationResignation>;

@Schema({ timestamps: true }) // Automatically add createdAt and updatedAt
export class EmployeeTerminationResignation {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId; // Reference to the employee

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: terminationAndResignationBenefits.name, required: true })
    benefitId: mongoose.Types.ObjectId; // Reference to the benefit

    @Prop({ required: true })
    givenAmount: number; // Amount manually given to this employee for the benefit

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: TerminationRequest.name, required: true })
    terminationId: mongoose.Types.ObjectId; // Reference to the termination request

    @Prop({ default: BenefitStatus.PENDING, type: String, enum: BenefitStatus })
    status: BenefitStatus; // Benefit status: pending, paid, approved, rejected
}

// Create Mongoose schema from the class
export const EmployeeTerminationResignationSchema = SchemaFactory.createForClass(EmployeeTerminationResignation);
