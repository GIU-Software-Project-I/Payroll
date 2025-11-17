import { Schema, Document } from 'mongoose';

export interface PayrollExceptionSubdoc {
  employeeId: string;
  code?: string;
  message: string;
  field?: string;
  resolved?: boolean;
  createdAt?: Date;
  resolvedAt?: Date | null;
}

export interface ReviewNoteSubdoc {
  authorId: string;
  role: string;
  note: string;
  createdAt: Date;
}

export interface PayrollRunDocument extends Document {
  runId: string;
  status: string;
  exceptions: PayrollExceptionSubdoc[];
  notes: ReviewNoteSubdoc[];
  createdAt: Date;
  updatedAt: Date;
}

export const PayrollExceptionSchema = new Schema<PayrollExceptionSubdoc>(
  {
    employeeId: { type: String, required: true },
    code: { type: String },
    message: { type: String, required: true },
    field: { type: String },
    resolved: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    resolvedAt: { type: Date, default: null },
  },
  { _id: false },
);

export const ReviewNoteSchema = new Schema<ReviewNoteSubdoc>(
  {
    authorId: { type: String, required: true },
    role: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

export const PayrollRunSchema = new Schema<PayrollRunDocument>(
  {
    runId: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    exceptions: { type: [PayrollExceptionSchema], default: [] },
    notes: { type: [ReviewNoteSchema], default: [] },
  },
  { timestamps: true },
);
