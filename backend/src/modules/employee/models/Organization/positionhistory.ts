// /database/os/position-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PositionHistoryDocument = PositionHistory & Document;

@Schema({ timestamps: true })
export class PositionHistory {
    @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
    positionId!: Types.ObjectId;

    // old / new snapshots (immutable historical record) — BR-22 + BR-37
    @Prop()
    oldValue!: Record<string, any>;

    @Prop()
    newValue!: Record<string, any>;

    // e.g. Create, Update, Deactivate, Delimit
    @Prop({ required: true })
    changeType!: string;

    // who changed it — BR-22
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    changedBy?: Types.ObjectId;

    // redundant timestamp for audit search (also createdAt)
    @Prop({ required: true })
    timestamp!: Date;
}

export const PositionHistorySchema = SchemaFactory.createForClass(PositionHistory);
