import { Schema, Document } from 'mongoose';

export interface AuditEntryDocument extends Document {
  runId: string;
  action: string;
  reason?: string;
  createdAt: Date;
}

export const AuditEntrySchema = new Schema<AuditEntryDocument>(
  {
    runId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
