import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type AssessmentTemplateDocument = HydratedDocument<AssessmentTemplate>

@Schema({ timestamps: true })
export class AssessmentTemplate {
  // rec020: template name for structured assessments
  @Prop({ required: true })
  name!: string;

  // rec020: criteria used for scoring (key, label, weight)
  @Prop([{ key: String, label: String, weight: Number }])
  criteria?: { key: string; label: string; weight: number }[];

  // rec020: optional notes or instructions for assessors
  @Prop({ default: '' })
  notes?: string;
}

export const AssessmentTemplateSchema = SchemaFactory.createForClass(AssessmentTemplate);
