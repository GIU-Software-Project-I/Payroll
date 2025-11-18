// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, HydratedDocument, Types } from 'mongoose';
// import { JobRequisition } from './job-requisition.schema';
//
// export type ApplicationDocument = HydratedDocument<Application>
//
// export enum ApplicationStatus {
//   APPLIED = 'applied',
//   SCREENING = 'screening',
//   SHORTLISTED = 'shortlisted',
//   INTERVIEW = 'interview',
//   OFFER = 'offer',
//   HIRED = 'hired',
//   REJECTED = 'rejected',
// WITHDRAWN = 'Withdrawn'
// }
//
// @Schema({ timestamps: true })
// export class Application {
//   // rec007: job reference applied to
//   @Prop({ type: Types.ObjectId, ref: 'JobRequisition', required: true })
//   job!: Types.ObjectId;
//
//   // rec007: candidate id (if created as user in system)
//   @Prop({ type: Types.ObjectId, ref: 'Candidate', required: false })
//   candidate?: Types.ObjectId;
//
//   // rec007: candidate name (stored for anonymous / external applicants)
//   @Prop()
//   candidateName?: string;
//
//   // rec007: candidate email
//   @Prop()
//   candidateEmail?: string;
//
//   // rec008/rec017: application lifecycle status (applied->screening->interview->offer->hired)
//   @Prop({ enum: Object.values(ApplicationStatus), default: ApplicationStatus.APPLIED })
//   status!: ApplicationStatus;
//
//   // rec007 / rec012: uploaded documents (resume/CV, cover letters, certificates)
//   @Prop([{ filename: String, url: String, uploadedAt: Date }])
//   documents?: { filename: string; url: string; uploadedAt: Date }[];
//
//   // generic key/value for external references (e.g., ATS ids)
//   @Prop({ default: {} })
//   refs?: Record<string, any>;
//
//   // rec008/rec009: history of status changes for audit and timeline
//   @Prop([{ status: String, changedBy: Types.ObjectId, at: Date, note: String }])
//   statusHistory?: { status: string; changedBy?: Types.ObjectId; at: Date; note?: string }[]; // ADD MANAGER OR HR REFERENCE FOR CHANGED BY
//
//   // rec030: referral tagging
//   @Prop({ default: false })
//   isReferral?: boolean;
//
//   // rec030: referral source details (e.g., employee id or campaign)
//   @Prop({ default: null })
//   referralSource?: string; // REFERENCE TO AN EMPLOYEE OR USER
//
//   // rec028: candidate consent for data processing/background checks
//   @Prop({ default: false })
//   consentGiven?: boolean;
//
//   // rec028: when consent was given
//   @Prop()
//   consentGivenAt?: Date;
//
//   // rec028: consent details or version identifier
//   @Prop()
//   consentDetails?: string;
//
//   // rec007/rec009: application source (careers_page, linkedin, referral)
//   @Prop({ default: '' })
//   applicationSource?: string; // e.g., 'careers_page', 'linkedin', 'referral'
//
//   // rec017 / rec022: communication logs (status updates, rejection notices, templates used)
//   @Prop([{ type: String, message: String, sentBy: Types.ObjectId, at: Date, channel: String }])
//   communicationLogs?: { type?: string; message?: string; sentBy?: Types.ObjectId; at?: Date; channel?: string }[];// REFERNCE HR OR MANAGER OR THE PERSON WHO PUT THE POSITION UP FOR HIRE
//
//   // rec004 / rec008: progress percentage calculated from template stages
//   @Prop({ default: 0 })
//   progressPercent?: number; // 0..100 calculated by stages completed
//
//   // rec020: assessment scores referencing AssessmentTemplate
//   @Prop([{ template: Types.ObjectId, score: Number, notes: String }])
//   assessmentScores?: { template?: Types.ObjectId; score?: number; notes?: string }[];
//
//   // rec008/rec017: who last updated the application status or details
//   @Prop({ type: Types.ObjectId, ref: 'HR' })
//   lastUpdatedBy?: Types.ObjectId;
// }
//
// export const ApplicationSchema = SchemaFactory.createForClass(Application);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

export enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'Withdrawn'
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'JobRequisition', required: true })
  job!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate' })
  candidate?: Types.ObjectId;

  @Prop()
  candidateName?: string;

  @Prop()
  candidateEmail?: string;

  @Prop({ enum: Object.values(ApplicationStatus), default: ApplicationStatus.APPLIED })
  status!: ApplicationStatus;

  @Prop({ type: [{ filename: String, url: String, uploadedAt: Date }] })
  documents?: { filename: string; url: string; uploadedAt: Date }[];

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  refs?: Record<string, unknown>;

  @Prop({ type: [{ status: String, changedBy: Types.ObjectId, at: Date, note: String }] })
  statusHistory?: { status: string; changedBy?: Types.ObjectId; at: Date; note?: string }[];

  @Prop({ default: false })
  isReferral?: boolean;

  @Prop({ default: null })
  referralSource?: string;

  @Prop({ default: false })
  consentGiven?: boolean;

  @Prop()
  consentGivenAt?: Date;

  @Prop()
  consentDetails?: string;

  @Prop({ default: '' })
  applicationSource?: string;

  @Prop({ type: [{ type: String, message: String, sentBy: Types.ObjectId, at: Date, channel: String }] })
  communicationLogs?: { type?: string; message?: string; sentBy?: Types.ObjectId; at?: Date; channel?: string }[];

  @Prop({ default: 0 })
  progressPercent?: number;

  @Prop({ type: [{ template: Types.ObjectId, score: Number, notes: String }] })
  assessmentScores?: { template?: Types.ObjectId; score?: number; notes?: string }[];

  @Prop({ type: Types.ObjectId, ref: 'HR' })
  lastUpdatedBy?: Types.ObjectId;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
