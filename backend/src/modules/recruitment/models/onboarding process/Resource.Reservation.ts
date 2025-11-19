import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument, Types} from 'mongoose';

export enum ReservationStatus{
REQUESTED='REQUESTED',
RESERVED='RESERVED',
    ALLOCATED='ALLOCATED',
    CANCELED='CANCELED',
}

export enum ResourceType{
    EQUIPMENT='EQUIPMENT',
    DESK= 'DESK',
    ACCESS_CARD='ACCESS CARD',
    LAPTOP='LAPTOP',
    PHONE='PHONE',
}

export type ResourceReservationDocument = HydratedDocument<ResourceReservation>;

@Schema({ timestamps: true })
export class ResourceReservation {
    @Prop({ type: Types.ObjectId, ref: 'Onboarding', required: true })
    onboarding?: Types.ObjectId; // Reference to onboarding - ONB-012

    @Prop({ enum: Object.values(ResourceType), required: true})
    resourceType?: ResourceType; // Type of resource being reserved - ONB-012, BR 9(c)

    @Prop({ required: true })
    resourceDescription?: string; // Specific details about the resource - ONB-012

    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    reservedBy?: Types.ObjectId; // HR employee who made reservation - ONB-012

    @Prop({ required: true })
    reservedUntil?: Date; // Reservation expiry date - ONB-012

    @Prop({ enum: ReservationStatus, required: true , default: ReservationStatus.REQUESTED })
    status?: ReservationStatus; // Reservation status - ONB-012

    @Prop()
    allocatedAt?: Date; // When resource was physically allocated - ONB-012

    @Prop()
    notes?: string; // Additional notes about the reservation - ONB-012
}

export const ResourceReservationSchema = SchemaFactory.createForClass(ResourceReservation);





