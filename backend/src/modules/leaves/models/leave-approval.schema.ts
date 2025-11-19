import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';
import { LeaveRequest } from './leave-request.schema.js';
import {CalendarHoliday} from "./calendar-holiday.schema";


export enum  LeaveApprovalStatus{
    APPROVED = "APPROVED",
    REJECTED="REJECTED"

}
export type LeaveApprovalDocument = HydratedDocument<LeaveApproval>

@Schema({ timestamps: true })
export class LeaveApproval {
  @Prop({ type: Types.ObjectId, ref: LeaveRequest.name, required: true })
  leaveRequestId!: Types.ObjectId;

  @Prop({ type:Types.ObjectId, ref:'Employee' ,required: true })
  actorId!: string; //  // Employee code or Mongo id from subsystem 1 ???

  @Prop({ required: true })
  actorType!: string; // manager, hr // Access Roles from subSystem 1

  @Prop({type:String, required: true, enum: Object.values(LeaveApprovalStatus),})
  action!: LeaveApprovalStatus;

  @Prop()
  note!: string;
}

export const LeaveApprovalSchema = SchemaFactory.createForClass(LeaveApproval);
