// backend/src/schemas/payroll-processing/payroll.run.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PayrollRun extends Document {
  @Prop({ required: true, unique: true })
  runId: string;
  @Prop({
    type: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    required: true,
  })
  payrollPeriod: {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
  };

  @Prop({
    type: String,
    enum: ['draft', 'under_review', 'approved', 'locked', 'paid'],
    default: 'draft',
  })
  status: string;

  @Prop([
    {
      type: {
        employeeId: { type: String, required: true },
        hrEvent: {
          type: String,
          enum: ['normal', 'new_hire', 'resignation', 'termination'],
          default: 'normal',
        },
        signingBonus: { type: Number, default: 0 },
        terminationBenefits: { type: Number, default: 0 },
        grossSalary: { type: Number, default: 0 },
        deductions: {
          type: {
            taxes: { type: Number, default: 0 },
            insurance: { type: Number, default: 0 },
            penalties: { type: Number, default: 0 },
          },
          default: {},
        },
        netSalary: { type: Number, default: 0 },
        finalSalary: { type: Number, default: 0 },
      },
    },
  ])
  employees: Array<{
    employeeId: string;
    hrEvent: string;
    signingBonus: number;
    terminationBenefits: number;
    grossSalary: number;
    deductions: {
      taxes: number;
      insurance: number;
      penalties: number;
    };
    netSalary: number;
    finalSalary: number;
  }>;

  @Prop([
    {
      type: {
        type: { type: String, required: true },
        employeeId: { type: String, required: true },
        description: { type: String, required: true },
        resolved: { type: Boolean, default: false },
      },
    },
  ])
  irregularities: Array<{
    type: string;
    employeeId: string;
    description: string;
    resolved: boolean;
  }>;

  @Prop([
    {
      type: {
        approverRole: {
          type: String,
          enum: ['payroll_specialist', 'payroll_manager', 'finance_staff'],
          required: true,
        },
        approverId: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        comments: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    },
  ])
  approvals: Array<{
    approverRole: string;
    approverId: string;
    status: string;
    comments?: string;
    timestamp: Date;
  }>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);
