import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument} from 'mongoose';

export type CalendarHolidayDocument = HydratedDocument<CalendarHoliday>

@Schema({ timestamps: true })
export class CalendarHoliday  {
  @Prop({ required: true, default: null})
  date!: Date;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: false })
  isBlocked!: boolean; // true = no leaves allowed on this date
}

export const CalendarHolidaySchema = SchemaFactory.createForClass(CalendarHoliday);
