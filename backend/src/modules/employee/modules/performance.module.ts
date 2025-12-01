import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {AppraisalTemplate, AppraisalTemplateSchema} from "../models/performance/appraisal-template.schema";
import {AppraisalCycle, AppraisalCycleSchema} from "../models/performance/appraisal-cycle.schema";
import {AppraisalAssignment, AppraisalAssignmentSchema} from "../models/performance/appraisal-assignment.schema";
import {AppraisalRecord, AppraisalRecordSchema} from "../models/performance/appraisal-record.schema";
import {AppraisalDispute, AppraisalDisputeSchema} from "../models/performance/appraisal-dispute.schema";
import {PerformanceController} from "../controllers/performance.controller";
import {PerformanceService} from "../services/performance.service";



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: AppraisalDispute.name, schema: AppraisalDisputeSchema },
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
