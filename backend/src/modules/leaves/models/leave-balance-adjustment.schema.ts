import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';
import { LeaveType } from './leave-type.schema';
import {LeaveBalance} from "./leave-balance.schema";

export type LeaveBalanceAdjustmentDocument = HydratedDocument<LeaveBalanceAdjustment>

@Schema({ timestamps: true })
export class LeaveBalanceAdjustment  {
  @Prop({ required: true })
  employeeId!: string; //

  @Prop({ type: Types.ObjectId, ref: LeaveType.name, required: true })
  leaveTypeId!: Types.ObjectId;

  @Prop({ required: true })
  changeAmount!: number; // positive or negative

  @Prop()
  reason!: string;

  @Prop({ default: 'manual' })
  source!: string;

  @Prop()
  performedBy!: string;
}

export const LeaveBalanceAdjustmentSchema =
  SchemaFactory.createForClass(LeaveBalanceAdjustment);
