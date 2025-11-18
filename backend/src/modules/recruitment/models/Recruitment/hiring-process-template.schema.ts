import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument } from 'mongoose';

export type HiringProcessTemplateDocument = HydratedDocument<HiringProcessTemplate>

@Schema({ timestamps: true })
export class HiringProcessTemplate {
  // rec004: template name
  @Prop({ required: true })
  name!: string;

  // rec004: ordered stages (e.g., ['screening','shortlist','interview','offer','hired'])
  @Prop([String])
  stages!: string[];

  // rec004: arbitrary metadata (e.g., timeouts, rules)
  @Prop({ default: {} })
  metadata?: Record<string, any>;

  // rec004: human-readable description of the hiring process template
  @Prop({ default: '' })
  description?: string;

  // rec004: whether progress percentage is auto-calculated from stages
  @Prop({ default: false })
  autoProgressEnabled?: boolean;
}

export const HiringProcessTemplateSchema = SchemaFactory.createForClass(HiringProcessTemplate);
