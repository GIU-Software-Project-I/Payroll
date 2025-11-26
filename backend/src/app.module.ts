import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PayrollProcessingModule} from './modules/payroll/processing/processing.module';
import { PayrollConfigModule } from './modules/payroll/config-policy/payroll-config.module';   
import {TimeManagementModule} from "./modules/time-management/time-management.module";


import { PayrollTrackingModule } from './modules/payroll/tracking/tracking.module';
import { RecruitmentModule } from "./modules/recruitment/module/Recruitment.module";
import { OrganizationStructureModule } from "./modules/employee/modules/organization-structure.module";
import { EmployeeModule } from "./modules/employee/modules/employee.module";
import { PerformanceModule } from "./modules/employee/modules/performance.module";
import { LeavesModule } from "./modules/leaves/modules/leaves.module";
import { AuthModule } from "./modules/auth/Module/auth-module";

import {AuthorizationGuard} from "./modules/auth/guards/authorization-guard";
import {AuthenticationGuard} from "./modules/auth/guards/authentication-guard";


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
        AuthModule,
        PayrollProcessingModule,
        PayrollConfigModule,
        PayrollTrackingModule,
        RecruitmentModule,
        EmployeeModule,
        OrganizationStructureModule,
        PerformanceModule,

        TimeManagementModule,
        LeavesModule,


    ],
    providers: [
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: AuthorizationGuard },
    ],
})
export class AppModule {}