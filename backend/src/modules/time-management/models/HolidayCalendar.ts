import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class HolidayCalendar {
    @Prop({ required: true })
    name!: string;

    @Prop({
        required: true,
        enum: ['NationalHoliday', 'OrganizationalHoliday', 'WeeklyRestDay'],
    })
    holidayType!: string; // Defines holiday type to suppress penalties

    @Prop({ required: true })
    date!: Date;

    @Prop({ default: false })
    recurring!: boolean;

    @Prop({ required: true })
    year?: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;
}

export const HolidayCalendarSchema = SchemaFactory.createForClass(HolidayCalendar);