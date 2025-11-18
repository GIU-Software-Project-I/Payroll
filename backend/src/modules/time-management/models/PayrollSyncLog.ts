//This class is for traceablilty

import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";

@Schema({ timestamps: true })
export class PayrollSyncLog {
    @Prop({ required: true }) syncDate!: Date;
    @Prop({ required: true }) payrollPeriod!: string;
    @Prop({ required: true }) employeeCount!: number;
    @Prop({ required: true }) recordsSynced!: number; // Count, not references
    @Prop({ enum: ['Success', 'Partial', 'Failed'], required: true }) status!: string;
    @Prop([{ type: String }]) errors!: string[];
    @Prop({ type: Types.ObjectId, ref: 'User' }) syncedBy!: Types.ObjectId;
}
export const PayrollSyncLogSchema = SchemaFactory.createForClass(PayrollSyncLog);
