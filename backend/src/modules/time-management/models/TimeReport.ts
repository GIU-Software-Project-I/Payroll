import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {AuditTrail} from "./AuditTrail";


export type ReportDocument = Report & Document;
@Schema()
export class Report {
    @Prop({ required: true })
    id!: string;

    @Prop({
        required: true,
        enum: ['Overtime', 'Exception', 'Penalty'],
    })
    reportType!: string;

    @Prop({ required: true })
    generatedBy!: string;

    @Prop({
        type: {
            summary: {
                totalEmployees: Number,
                totalOvertimeHours: Number,
                totalExceptions: Number,
                totalPenalties: Number,
            },
            details: [
                {
                    employeeId: String,
                    metrics: {
                        overtimeHours: Number,
                        exceptionType: String,
                        penaltyReason: String,
                        penaltyAmount: Number,
                    },
                },
            ],
        },
    })
    content!: Record<string, any>;

    @Prop({ required: true, default: Date.now })
    createdAt!: Date;

    @Prop({type: [AuditTrail], default: []}) // Reference to standalone schema
    auditTrail?: typeof AuditTrail[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);