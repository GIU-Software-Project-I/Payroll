import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';
import { LeaveType } from './leave-type.schema';
import {CalendarHoliday} from "./calendar-holiday.schema";


export type LeaveBalanceDocument = HydratedDocument<LeaveBalance>

@Schema({ timestamps: true })
export class LeaveBalance  {
  @Prop({ required: true })
  employeeId!: string; // Employee code or Mongo id from subsystem 1 ???

  @Prop({ type: Types.ObjectId, ref: LeaveType.name, required: true })
  leaveTypeId!: Types.ObjectId;

  @Prop({ default: 0 })
  currentBalance!: number;

  @Prop({ default: 0 })
  accrued!: number;

  @Prop({ default: 0 })
  taken!: number;

  @Prop({ default: 0 })
  pending!: number;

  @Prop({ default: 0 })
  carryover!: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
