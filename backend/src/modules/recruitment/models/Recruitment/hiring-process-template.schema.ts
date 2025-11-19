import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type HiringProcessTemplateDocument = HydratedDocument<HiringProcessTemplate>;

@Schema({ timestamps: true })
export class HiringProcessTemplate {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [String], required: true, default: [] })
  stages!: string[];

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: false })
  autoProgressEnabled?: boolean;
}

export const HiringProcessTemplateSchema = SchemaFactory.createForClass(HiringProcessTemplate);
