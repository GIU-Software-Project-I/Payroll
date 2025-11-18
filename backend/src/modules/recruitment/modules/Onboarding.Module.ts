import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnBoardingDocumentService } from "../services/OnBoarding/OnBoarding-Document-Service";
import { OnBoardingService } from "../services/OnBoarding/OnBoarding-Service";
import { OnboardingTaskTemplateService } from "../services/OnBoarding/OnBoarding-Task-Template.Service";
import { PayrollInitialService } from "../services/OnBoarding/Payroll-Initial.Service";
import { ResourceReservationService } from "../services/OnBoarding/Resource-Reservation.Service";
import { SystemAccessService } from "../services/OnBoarding/System-Access.Service";
import { SystemAccessController } from "../controllers/OnBoarding/System-Access.Controller";
import { ResourceReservationController } from "../controllers/OnBoarding/Resource-Reservation-Controller";
import { PayrollInitialController } from "../controllers/OnBoarding/Payroll-initiator-Controller";
import { OnboardingTaskTemplateController } from "../controllers/OnBoarding/OnBoarding-Task.Template-Controller";
import { OnBoardingController } from "../controllers/OnBoarding/OnBoarding-Controller";
import { OnBoardingDocumentController } from "../controllers/OnBoarding/OnBoardingDocument.Controller";

import { ResourceReservationSchema } from '../models/onboarding process/Resource.Reservation';
import {SystemAccessProvisioning} from "../models/onboarding process/System.Access.Schema";
import {PayrollInitiation} from "../models/onboarding process/PayrollInitial.schema";
import {OnboardingTask} from "../models/onboarding process/Onboarding.Task-template";
import {OnboardingProcess} from "../models/onboarding process/OnBoarding.Schema";
import {OnboardingDocumentUpload} from "../models/onboarding process/OnBoarding.Document";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'OnBoardingDocument', schema:OnboardingDocumentUpload  },
            { name: 'OnBoarding', schema:  OnboardingProcess },
            { name: 'OnboardingTaskTemplate', schema: OnboardingTask  },
            { name: 'PayrollInitial', schema: PayrollInitiation },
            { name: 'ResourceReservation', schema: ResourceReservationSchema },
            { name: 'SystemAccess', schema: SystemAccessProvisioning }
        ])
    ],
    controllers: [
        OnBoardingDocumentController,
        OnBoardingController,
        OnboardingTaskTemplateController,
        PayrollInitialController,
        ResourceReservationController,
        SystemAccessController
    ],
    providers: [
        OnBoardingDocumentService,
        OnBoardingService,
        OnboardingTaskTemplateService,
        PayrollInitialService,
        ResourceReservationService,
        SystemAccessService
    ],
    exports: [
        OnBoardingDocumentService,
        OnBoardingService,
        OnboardingTaskTemplateService,
        PayrollInitialService,
        ResourceReservationService,
        SystemAccessService
    ]
})
export class OnboardingModule {}
