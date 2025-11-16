import { Schema, model } from "mongoose";

const LegalUpdateSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    previousValues: { type: Object },
    newValues: { type: Object },
    changedBy: { type: String, required: true },
    relatedRuleId: { type: String },
    type: { type: String, enum: ["tax","insurance", "other"], default: "tax" }
  },
  { timestamps: true }
);

export const LegalUpdate = model("LegalUpdate", LegalUpdateSchema);
