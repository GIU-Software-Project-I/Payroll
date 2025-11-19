import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import {TimeManagementModule} from "./modules/time-management/time-management.module";
import {LeavesModule} from "./modules/leaves/modules/Leaves.Module";
import {RecruitmentModule} from "./modules/recruitment/modules/Recruitment.Module";
import {OnboardingModule} from "./modules/recruitment/modules/Onboarding.Module";
import {OffboardingModule} from "./modules/recruitment/modules/Offboarding.Module";
import {EmployeeModule} from "./modules/employee/modules/Employee.Module";



@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        EmployeeModule,
        TimeManagementModule,
LeavesModule,
        RecruitmentModule,
        OnboardingModule,
        OffboardingModule,

    ],
    // providers: [
    //     { provide: APP_GUARD, useClass: JwtAuthGuard },
    //     { provide: APP_GUARD, useClass: RolesGuard },
    // ],
})
export class AppModule {}