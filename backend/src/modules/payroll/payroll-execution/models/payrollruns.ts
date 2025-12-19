import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // NestJS Mongoose decorators
import mongoose, { HydratedDocument } from 'mongoose'; // Mongoose for ObjectId and document typing
import { EmployeeProfile as Employee } from '../../../employee/models/employee/employee-profile.schema';
import { PayRollPaymentStatus, PayRollStatus } from '../enums/payroll-execution-enum';
import { Department } from '../../../employee/models/organization-structure/department.schema';

// Type for a Mongoose document of payrollRuns
export type payrollRunsDocument = HydratedDocument<payrollRuns>;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt fields
export class payrollRuns {
  @Prop({ required: true, unique: true })
  runId: string; // Unique ID for payroll run (e.g., PR-2025-0001)

  @Prop({ required: true })
  payrollPeriod: Date; // End date of payroll period (e.g., 31-01-2025)

  @Prop({ required: true, type: String, enum: PayRollStatus, default: PayRollStatus.DRAFT })
  status: PayRollStatus; // Payroll status (Draft, Submitted, Approved, etc.)

  @Prop({ required: true })
  entity: string; // Name of the company/department

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Department.name })
  entityId?: mongoose.Types.ObjectId; // Optional department ID for filtering employees

  @Prop({ required: true })
  employees: number; // Number of employees included in the run

  @Prop({ required: true })
  exceptions: number; // Count of exceptions (errors or special cases)

  @Prop({ required: true })
  totalnetpay: number; // Total net pay for all employees

  // Aggregated totals from employee payroll details
  @Prop({ default: 0 })
  totalGrossPay: number; // Total gross pay for all employees

  @Prop({ default: 0 })
  totalDeductions: number; // Total of all deductions (tax + insurance + penalties)

  @Prop({ default: 0 })
  totalTaxDeductions: number; // Total tax deductions
  @Prop({ default: 0 })
  totalInsuranceDeductions: number; // Total insurance deductions
  @Prop({ default: 0 })
  totalPenalties: number; // Total penalties
  @Prop({ default: 0 })
  totalAllowances: number; // Total allowances
  @Prop({ default: 0 })
  totalBaseSalary: number; // Total base salaries
  @Prop({ default: 0 })
  totalOvertime: number; // Total overtime payments
  @Prop({ default: 0 })
  totalRefunds: number; // Total refunds given

  // Aggregated irregularities
  @Prop({ default: 0 })
  irregularitiesCount: number; // Number of irregularities detected
  @Prop({ type: [String], default: [] })
  irregularities: string[]; // List of irregularity descriptions

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollSpecialistId: mongoose.Types.ObjectId; // Employee who created the payroll run

  @Prop({ required: true, type: String, enum: PayRollPaymentStatus, default: PayRollPaymentStatus.PENDING })
  paymentStatus: PayRollPaymentStatus; // Payment status (Pending, Paid, etc.)

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollManagerId?: mongoose.Types.ObjectId; // Optional payroll manager approving the run

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  financeStaffId?: mongoose.Schema.Types.ObjectId; // Optional finance staff approving payment

  @Prop()
  rejectionReason?: string; // Reason for rejection if payroll run was rejected

  @Prop()
  unlockReason?: string; // Reason for unlocking the payroll run

  @Prop()
  managerApprovalDate?: Date; // Date manager approved the payroll

  @Prop()
  financeApprovalDate?: Date; // Date finance approved the payroll
}

// Create Mongoose schema from the class
export const payrollRunsSchema = SchemaFactory.createForClass(payrollRuns);
