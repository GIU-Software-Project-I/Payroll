// /database/os/position-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PositionHistoryDocument = PositionHistory & Document;

@Schema({ timestamps: true })
export class PositionHistory {
    @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
    positionId!: Types.ObjectId;

    // old / new snapshots (immutable historical record) — BR-22 + BR-37
    @Prop({ type: MongooseSchema.Types.Mixed })
    oldValue!: Record<string, any>;

    @Prop({ type: MongooseSchema.Types.Mixed })
    newValue!: Record<string, any>;

    // e.g. Create, Update, Deactivate, Delimit
    @Prop({ required: true })
    changeType!: string;

    // who changed it — BR-22
    @Prop({ type: Types.ObjectId, ref: 'HR', required: true })
    changedBy?: Types.ObjectId;

    // redundant timestamp for audit search (also createdAt)
    @Prop({ type: Date, required: true })
    timestamp!: Date;
}

export const PositionHistorySchema = SchemaFactory.createForClass(PositionHistory);
