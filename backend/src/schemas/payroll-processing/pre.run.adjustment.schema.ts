// backend/src/schemas/payroll-processing/pre.run.adjustment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PreRunAdjustmentStatus, PreRunAdjustmentType } from '../../dto/payroll-process/pre.run.adjustment.dto';

@Schema({
  collection: 'pre_run_adjustments',
  timestamps: true,
})
export class PreRunAdjustment {
  @Prop({ type: String, enum: PreRunAdjustmentType, required: true })
  type: PreRunAdjustmentType;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  // Enforce non-negative values to align with DTO validation and business rules
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: String, default: 'EGP' })
  currency: string;

  @Prop({ type: String, enum: PreRunAdjustmentStatus, default: PreRunAdjustmentStatus.PENDING })
  status: PreRunAdjustmentStatus;

  @Prop()
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  rejectedBy?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;
}

export type PreRunAdjustmentDocument = PreRunAdjustment & Document;
export const PreRunAdjustmentSchema = SchemaFactory.createForClass(PreRunAdjustment);

// Helpful indexes for Phase 0 queries (list pending with optional filters)
PreRunAdjustmentSchema.index({ status: 1, type: 1, departmentId: 1, createdAt: -1 });
PreRunAdjustmentSchema.index({ employeeId: 1, status: 1, createdAt: -1 });
