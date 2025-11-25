import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import { JobTemplate, JobTemplateSchema } from '../models/job-template.schema';
import { JobRequisition, JobRequisitionSchema } from '../models/job-requisition.schema';
import {Application, ApplicationSchema} from "../models/application.schema";
import { ApplicationStatusHistory, ApplicationStatusHistorySchema } from '../models/application-history.schema';
import {Interview, InterviewSchema} from '../models/interview.schema';
import {AssessmentResult, AssessmentResultSchema} from "../models/assessment-result.schema";
import {Referral, ReferralSchema} from '../models/referral.schema';
import {Offer, OfferSchema} from "../models/offer.schema";
import {Contract, ContractSchema} from "../models/contract.schema";

import {TerminationRequest, TerminationRequestSchema} from "../models/termination-request.schema";
import {ClearanceChecklist, ClearanceChecklistSchema} from "../models/clearance-checklist.schema";
import {RecruitmentService} from "../services/Recruitment/initial-Recruitmet.service";
import { OnBoardingService} from "../services/OnBoarding/initial-OnBoarding.service";
import {RecruitmentController} from "../controllers/Recruitment/initial-Recruitment.controller";
import {OnBoardingController} from "../controllers/OnBoarding/initial-OnBoarding.controller";
import {OffBoardingController} from "../controllers/Offboarding/initial-OffBoarding.controller";
import {OffBoardingService} from "../services/OffBoarding/initial-OffBoarding.service";
import {DocumentSchema,Document} from "../models/document.schema";
import {EmployeeModule} from "../../employee/modules/employee.module";

function lOnBoardingService() {

}

@Module({
    imports:[MongooseModule.forFeature([
        { name: JobTemplate.name, schema: JobTemplateSchema },
        { name: JobRequisition.name, schema: JobRequisitionSchema },
        { name: Application.name, schema: ApplicationSchema },
        { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
        { name: Interview.name, schema: InterviewSchema },
        { name: AssessmentResult.name, schema: AssessmentResultSchema },
        { name: Referral.name, schema: ReferralSchema },
        { name: Offer.name, schema: OfferSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Document.name, schema: DocumentSchema },
        { name: TerminationRequest.name, schema: TerminationRequestSchema },
        { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
    ]),
        EmployeeModule
    ],
    controllers: [RecruitmentController,OnBoardingController,OffBoardingController],
    providers: [RecruitmentService,OnBoardingService,OffBoardingService],
    exports:[RecruitmentService,OnBoardingService,OffBoardingService]

})
export class RecruitmentModule {}
