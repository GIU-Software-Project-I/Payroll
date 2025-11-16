import { Schema, model } from "mongoose";

const TaxRuleSchema = new Schema(
  {
    name: { type: String, required: true },
    brackets: [
      { min: { type: Number, required: true }, max: { type: Number, required: true }, percent: { type: Number, required: true } }
    ],
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Approved", "Active", "Deprecated"], default: "Pending" },
    version: { type: Number, default: 1 },
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { timestamps: true }
);

export const TaxRule = model("TaxRule", TaxRuleSchema);
