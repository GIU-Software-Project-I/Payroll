import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationSchema } from '../models/Recruitment/application.schema';
import { AssessmentTemplateSchema } from '../models/Recruitment/assessment-template.schema';
import { HiringProcessTemplateSchema } from '../models/Recruitment/hiring-process-template.schema';
import { InterviewSchema } from '../models/Recruitment/interview.schema';
import { JobRequisitionSchema } from '../models/Recruitment/job-requisition.schema';
import { OfferSchema } from '../models/Recruitment/offer.schema';
import {AssessmentTemplateController} from "../controllers/Recruitment/AssessmentTemplate-Controller";
import {ApplicationController} from "../controllers/Recruitment/Application-Controller";
import {HiringProcessTemplateController} from "../controllers/Recruitment/HiringProcessTemplate-Controller";
import {InterviewController} from "../controllers/Recruitment/Interview-Controller";
import {JobRequisitionController} from "../controllers/Recruitment/JobRequisition-Controller";
import {OfferController} from "../controllers/Recruitment/Offer-Controller";
import {ApplicationService} from "../services/Recruitment/Application-Service";
import {HiringProcessTemplateService} from "../services/Recruitment/Hiring-Template-Service";
import {InterviewService} from "../services/Recruitment/Interview-Service";
import { OfferService} from "../services/Recruitment/Offer-Service";
import {AssessmentTemplateService} from "../services/Recruitment/AssesemntTemplate-Service";
import {JobRequisitionService} from "../services/Recruitment/Job-Requisition-Service";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Application', schema: ApplicationSchema },
            { name: 'AssessmentTemplate', schema: AssessmentTemplateSchema },
            { name: 'HiringProcessTemplate', schema: HiringProcessTemplateSchema },
            { name: 'Interview', schema: InterviewSchema },
            { name: 'JobRequisition', schema: JobRequisitionSchema },
            { name: 'Offer', schema: OfferSchema }
        ])
    ],
    controllers: [
        ApplicationController,
        AssessmentTemplateController,
        HiringProcessTemplateController,
        InterviewController,
        JobRequisitionController,
        OfferController
    ],
    providers: [
        ApplicationService,
        AssessmentTemplateService,
        HiringProcessTemplateService,
        InterviewService,
        JobRequisitionService,
        OfferService
    ],
    exports: [
        ApplicationService,
        AssessmentTemplateService,
        HiringProcessTemplateService,
        InterviewService,
        JobRequisitionService,
        OfferService
    ]
})
export class RecruitmentModule {}
