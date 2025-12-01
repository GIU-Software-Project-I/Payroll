import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from '../models/application.schema';
import { ApplicationStatusHistory, ApplicationStatusHistorySchema } from '../models/application-history.schema';
import { AssessmentResult, AssessmentResultSchema } from '../models/assessment-result.schema';
import { ClearanceChecklist, ClearanceChecklistSchema } from '../models/clearance-checklist.schema';
import { Contract, ContractSchema } from '../models/contract.schema';
import { Document, DocumentSchema } from '../models/document.schema';
import { Onboarding, OnboardingSchema } from '../models/onboarding.schema';
import { TerminationRequest, TerminationRequestSchema } from '../models/termination-request.schema';

import { OnboardingService } from '../services/onboarding.service';
import { OffboardingService } from '../services/offboarding.service';
import { OnboardingController } from '../controllers/onboarding.controller';
import { OffboardingController } from '../controllers/offboarding.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Application.name, schema: ApplicationSchema },
            { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
            { name: AssessmentResult.name, schema: AssessmentResultSchema },
            { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
            { name: Contract.name, schema: ContractSchema },
            { name: Document.name, schema: DocumentSchema },
            { name: Onboarding.name, schema: OnboardingSchema },
            { name: TerminationRequest.name, schema: TerminationRequestSchema },
        ]),
        //EmployeeProfileModule
    ],
    controllers: [OnboardingController, OffboardingController],
    providers: [OnboardingService, OffboardingService],
    exports: [OnboardingService, OffboardingService],
})
export class RecruitmentModule {}
