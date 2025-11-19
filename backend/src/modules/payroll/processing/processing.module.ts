import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollProcessingService } from '../processing/services/payroll.processing.service';
import { PayrollProcessingController } from '../processing/controllers/payroll.processing.controller';

import { PayrollRun, PayrollRunSchema } from '../processing/entities/payroll.run.schema';

import {
  ExternalDataCache,
  ExternalDataCacheSchema,
} from '../processing/entities/external.data.cache.schema';

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
