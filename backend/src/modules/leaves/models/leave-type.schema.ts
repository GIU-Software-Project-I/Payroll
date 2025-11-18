import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument} from 'mongoose';
import {LeaveBalance} from "./leave-balance.schema";
import {LeaveRequest} from "./leave-request.schema";

export enum leaveCategory{
ANNUAL="Annual",
    MATERNITY="Material",
    MISSION="Mission",
    UNPAID="UNPAID",
SICK="SICK",
OTHER="Other",
}

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>

@Schema({ timestamps: true })
export class LeaveType {
  @Prop({ required: true, unique: true })
  code!: string; // ex: ANL, SCK

  @Prop({ required: true })
  name!: string; // Annual, Sick, etc.

  @Prop({required: true, enum:Object.values(leaveCategory)})
  category!: leaveCategory;

  @Prop({ default: false })
  requiresDocument!: boolean; // linked to REQ-016
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);
