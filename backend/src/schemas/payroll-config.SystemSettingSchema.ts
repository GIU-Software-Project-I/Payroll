import { Schema, model } from "mongoose";

const SystemSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const SystemSetting = model("SystemSetting", SystemSettingSchema);
