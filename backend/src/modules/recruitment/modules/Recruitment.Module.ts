import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Application, ApplicationSchema} from '../models/Recruitment/application.schema';
import {AssessmentTemplate, AssessmentTemplateSchema} from '../models/Recruitment/assessment-template.schema';
import {HiringProcessTemplate, HiringProcessTemplateSchema} from '../models/Recruitment/hiring-process-template.schema';
import {Interview, InterviewSchema} from '../models/Recruitment/interview.schema';
import {JobRequisition, JobRequisitionSchema} from '../models/Recruitment/job-requisition.schema';
import {Offer, OfferSchema} from '../models/Recruitment/offer.schema';
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
            { name: Application.name, schema: ApplicationSchema },
            { name: AssessmentTemplate.name, schema: AssessmentTemplateSchema },
            { name: HiringProcessTemplate.name
                , schema: HiringProcessTemplateSchema },
            { name: Interview.name, schema: InterviewSchema },
            { name: JobRequisition.name, schema: JobRequisitionSchema },
            { name: Offer.name, schema: OfferSchema }
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
