import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument, Types } from 'mongoose';

export type JobRequisitionDocument = HydratedDocument<JobRequisition>

export enum JobRequisitionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}
@Schema({ timestamps: true })
export class JobRequisition {
  // rec003: job title (part of standardized job description template)
  @Prop({ required: true })
  title!: string;

  // rec003: department (links to Organization Structure)
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  position!: Types.ObjectId;

  // rec003: job location
  @Prop()
  location?: string;

  // rec003: number of openings
  @Prop({ default: 1 })
  openings!: number;

  // rec003: required qualifications
  @Prop([String])
  qualifications?: string[];

  // rec003: required skills
  @Prop([String])
  skills?: string[];

  // rec003: job description / responsibilities
  @Prop({ default: '' })
  description?: string;

  // rec023: employer-brand content for careers page (HTML/markdown)
  @Prop({ default: '' })
  employerBrandContent?: string;

  // rec023: publish channels for the job posting (internal/external)
  @Prop([String])
  publishChannels?: string[]; // e.g. ['internal','external','linkedin']

  // rec023: when the job was published
  @Prop()
  publishedAt?: Date;


  // rec003: user who created the requisition
  @Prop({ type: Types.ObjectId, ref: 'HR' })
  createdBy?: Types.ObjectId;

  // rec023: who posted the job
  @Prop({ type: Types.ObjectId, ref: 'HR' })
  postedBy?: Types.ObjectId; // HR OR MANAGER

  // rec023: external career sites URLs where the job was posted
  @Prop([String])
  externalCareerUrls?: string[];

  // rec003: requisition lifecycle status
  @Prop({ enum: Object.values(JobRequisitionStatus), default: JobRequisitionStatus.DRAFT })
  status!: JobRequisitionStatus;

  // rec004: hiring process template used for candidate tracking & progress
  @Prop({ type: Types.ObjectId, ref: 'HiringProcessTemplate' })
  hiringProcessTemplate?: Types.ObjectId;
}

export const JobRequisitionSchema = SchemaFactory.createForClass(JobRequisition);
