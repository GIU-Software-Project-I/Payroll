import { Schema, model } from "mongoose";

const BackupRoutineSchema = new Schema(
  {
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    time: { type: String, required: true },
    target: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const BackupRoutine = model("BackupRoutine", BackupRoutineSchema);
