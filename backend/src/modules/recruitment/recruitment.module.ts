import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

// Models
import { Application, ApplicationSchema } from "./models/application.schema";
import { ApplicationStatusHistory, ApplicationStatusHistorySchema } from './models/application-history.schema';
import { AssessmentResult, AssessmentResultSchema } from "./models/assessment-result.schema";
import { ClearanceChecklist, ClearanceChecklistSchema } from "./models/clearance-checklist.schema";
import { JobTemplate, JobTemplateSchema } from './models/job-template.schema';
import { JobRequisition, JobRequisitionSchema } from './models/job-requisition.schema';
import { Referral, ReferralSchema } from './models/referral.schema';
import { Interview, InterviewSchema } from './models/interview.schema';
import { Offer, OfferSchema } from "./models/offer.schema";
import { Contract, ContractSchema } from "./models/contract.schema";
import { Document, DocumentSchema } from "./models/document.schema";
import { Onboarding, OnboardingSchema } from "./models/onboarding.schema";
import { TerminationRequest, TerminationRequestSchema } from "./models/termination-request.schema";

// controllers
import { RecruitmentController } from "./controllers/recruitment.controller";
import {OffboardingController} from "./controllers/offboarding.controller";
import {OnboardingController} from "./controllers/onboarding.controller";

// services
import { RecruitmentService } from "./services/recruitment.service";
import {OffboardingService} from "./services/offboarding.service";
import {OnboardingService} from "./services/onboarding.service";

// Shared Module
import { SharedModule } from "../shared/shared.module";


@Module({
    imports: [
        MongooseModule.forFeature([
            // Recruitment Models
            { name: JobTemplate.name, schema: JobTemplateSchema },
            { name: JobRequisition.name, schema: JobRequisitionSchema },
            { name: Application.name, schema: ApplicationSchema },
            { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
            { name: Referral.name, schema: ReferralSchema },
            { name: Interview.name, schema: InterviewSchema },
            { name: AssessmentResult.name, schema: AssessmentResultSchema },
            { name: Offer.name, schema: OfferSchema },
            { name: Contract.name, schema: ContractSchema },
            { name: Document.name, schema: DocumentSchema },
            { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
            { name: Onboarding.name, schema: OnboardingSchema },
            { name: TerminationRequest.name, schema: TerminationRequestSchema },
        ]),
        SharedModule,
    ],
    controllers: [RecruitmentController, OnboardingController, OffboardingController],
    providers: [RecruitmentService, OnboardingService, OffboardingService],
    exports: [RecruitmentService, OnboardingService, OffboardingService]
})
export class RecruitmentModule {}

