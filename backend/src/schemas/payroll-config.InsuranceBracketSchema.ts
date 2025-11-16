import { Schema, model } from "mongoose";

const InsuranceBracketSchema = new Schema(
  {
    name: { type: String, required: true },
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    employeeContribution: { type: Number, required: true },
    employerContribution: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Active", "Deprecated"], default: "Pending" },
    version: { type: Number, default: 1 },
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { timestamps: true }
);

export const InsuranceBracket = model("InsuranceBracket", InsuranceBracketSchema);
