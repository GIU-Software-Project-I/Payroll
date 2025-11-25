/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// backend/src/module/payroll.processing/payroll.processing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayrollRun } from '../entities/payroll.run.schema';
import { ExternalDataCache } from '../entities/external.data.cache.schema';
import { DummyPayrollRuns, DummyExternalData } from '../data/dummy.payroll.data';

@Injectable()
export class PayrollProcessingService {
  constructor(
    @InjectModel(PayrollRun.name) private payrollRunModel: Model<PayrollRun>,

    @InjectModel(ExternalDataCache.name) private externalDataModel: Model<ExternalDataCache>,
  ) {
    console.log('PayrollRun Model:', this.payrollRunModel ? '✅ Loaded' : '❌ Missing');
    console.log('ExternalDataCache Model:', this.externalDataModel ? '✅ Loaded' : '❌ Missing');
  }

  async seedDummyData() {
    try {
      await this.payrollRunModel.deleteMany({});
      await this.externalDataModel.deleteMany({});

      await this.payrollRunModel.insertMany(DummyPayrollRuns);
      await this.externalDataModel.insertMany(DummyExternalData);

      return {
        success: true,
        message: 'Dummy data seeded successfully',
        payrollRuns: DummyPayrollRuns.length,
        externalData: DummyExternalData.length,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }


  async getAllPayrollRuns() {
    return this.payrollRunModel.find().exec();
  }
}
