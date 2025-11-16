import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApprovalActionType } from '../../dto/payroll-process/approval.action.dto';
@Schema({
  collection: 'approval_actions',
  timestamps: true,
})
export class ApprovalAction {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId: Types.ObjectId;

  @Prop({ type: String, required: true })
  actorRole: string;

  @Prop({ type: String, enum: ApprovalActionType, required: true })
  action: ApprovalActionType;

  @Prop()
  reason?: string;
}

export type ApprovalActionDocument = ApprovalAction & Document;
export const ApprovalActionSchema = SchemaFactory.createForClass(ApprovalAction);
