// backend/src/schemas/payroll-processing/external.data.cache.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ExternalDataCache extends Document {
  @Prop({ required: true })
  employeeId: string;

  @Prop({
    type: {
      employmentType: { type: String, required: true },
      baseSalary: { type: Number, required: true },
      department: { type: String, required: true },
      contractStatus: {
        type: String,
        enum: ['active', 'expired', 'inactive'],
        default: 'active',
      },
    },
    required: true,
  })
  employeeData: {
    employmentType: string;
    baseSalary: number;
    department: string;
    contractStatus: string;
  };

  @Prop({
    type: {
      workedHours: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
    },
    default: {},
  })
  timeData: {
    workedHours: number;
    overtimeHours: number;
    absentDays: number;
  };

  @Prop({
    type: {
      unpaidLeaveDays: { type: Number, default: 0 },
    },
    default: {},
  })
  leaveData: {
    unpaidLeaveDays: number;
  };

  @Prop({ default: Date.now })
  lastSynced: Date;
}

export const ExternalDataCacheSchema = SchemaFactory.createForClass(ExternalDataCache);
