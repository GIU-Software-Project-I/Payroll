import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollProcessingService } from './payroll.processing.service';
import { PayrollProcessingController } from './payroll.processing.controller';

import { PayrollRun, PayrollRunSchema } from '../../schemas/payroll-processing/payroll.run.schema';

import {
  ExternalDataCache,
  ExternalDataCacheSchema,
} from '../../schemas/payroll-processing/external.data.cache.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: ExternalDataCache.name, schema: ExternalDataCacheSchema },
    ]),
  ],
  providers: [PayrollProcessingService],
  controllers: [PayrollProcessingController],
})
export class PayrollProcessingModule {}
