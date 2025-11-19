// asset-return-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssetReturnRecordDocument = AssetReturnRecord & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class AssetReturnRecord {
    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId!: Types.ObjectId;

    @Prop()
    title?: string;

    @Prop()
    serialNumber?: string;

    @Prop({
        type: String,
        enum: ['returned', 'missing', 'damaged', 'not_applicable'],
        default: 'returned',
    })
    status!: 'returned' | 'missing' | 'damaged' | 'not_applicable';


    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receivedBy!: Types.ObjectId;


    @Prop({ type: Date, required: true })
    receivedAt!: Date;


    @Prop()
    notes?: string;

    @Prop({ type: Types.ObjectId, ref: 'ClearanceInstance' })
    clearanceInstanceId?: Types.ObjectId;
}

export const AssetReturnRecordSchema = SchemaFactory.createForClass(AssetReturnRecord);