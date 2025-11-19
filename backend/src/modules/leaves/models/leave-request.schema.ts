import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';
import { LeaveType } from './leave-type.schema';
import {LeaveBalance} from "./leave-balance.schema";

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>

export enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED="rejected",
    CANCELLED = "cancelled",
}

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ required: true })
  employeeId!: string; //  // Employee code or Mongo id from subsystem 1 ???

  @Prop({ type: Types.ObjectId, ref: LeaveType.name, required: true })
  leaveTypeId!: Types.ObjectId;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  durationDays!: number;

  @Prop({ String: true , enum: Object.values(LeaveStatus), required: true, default: LeaveStatus.PENDING })
  status!: LeaveStatus;

  @Prop()
  justification!: string;

  @Prop()
  attachmentUrls!: string[]; // combine attachments in the same schema

  @Prop()
  submittedAt!: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
