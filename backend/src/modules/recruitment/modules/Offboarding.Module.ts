import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetReturnRecordSchema } from '../models/offboarding/asset-return-record.schema';
import { ClearanceChecklistTemplateSchema } from '../models/offboarding/clearance-checklist-template';
import { ClearanceDepartmentSignoffSchema } from '../models/offboarding/clearance-department-signoff.schema';
import { ClearanceInstanceSchema } from '../models/offboarding/clearance-instance.schema';
import { FinalSettlementSchema } from '../models/offboarding/final-settelment';
import { OffboardingRequestSchema } from '../models/offboarding/offboarding-schema';
import { AssetReturnRecordController } from '../controllers/offboarding/asset-return-record.controller';
import { ClearanceChecklistTemplateController } from '../controllers/offboarding/clearance-checklist-template.controller';
import { ClearanceDepartmentSignoffController } from '../controllers/offboarding/clearance-department-signoff.controller';
import { ClearanceInstanceController } from '../controllers/offboarding/clearance-instance.controller';
import { FinalSettlementController } from '../controllers/offboarding/final-settlement.controller';
import { OffboardingController } from '../controllers/offboarding/offboarding.controller';
import { AssetReturnRecordService } from '../services/offboarding/asset-return-record.service';
import { ClearanceChecklistTemplateService } from '../services/offboarding/clearance-checklist-template.service';
import { ClearanceDepartmentSignoffService } from '../services/offboarding/clearance-department-signoff.service';
import { ClearanceInstanceService } from '../services/offboarding/clearance-instance.service';
import { FinalSettlementService } from '../services/offboarding/final-settlement.service';
import { OffboardingService } from '../services/offboarding/offboarding.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssetReturnRecord', schema: AssetReturnRecordSchema },
      { name: 'ClearanceChecklistTemplate', schema: ClearanceChecklistTemplateSchema },
      { name: 'ClearanceDepartmentSignoff', schema: ClearanceDepartmentSignoffSchema },
      { name: 'ClearanceInstance', schema: ClearanceInstanceSchema },
      { name: 'FinalSettlement', schema: FinalSettlementSchema },
      { name: 'OffboardingRequest', schema: OffboardingRequestSchema }
    ])
  ],
  controllers: [
    AssetReturnRecordController,
    ClearanceChecklistTemplateController,
    ClearanceDepartmentSignoffController,
    ClearanceInstanceController,
    FinalSettlementController,
    OffboardingController
  ],
  providers: [
    AssetReturnRecordService,
    ClearanceChecklistTemplateService,
    ClearanceDepartmentSignoffService,
    ClearanceInstanceService,
    FinalSettlementService,
    OffboardingService
  ],
  exports: [
    AssetReturnRecordService,
    ClearanceChecklistTemplateService,
    ClearanceDepartmentSignoffService,
    ClearanceInstanceService,
    FinalSettlementService,
    OffboardingService
  ]
})
export class OffboardingModule {}

