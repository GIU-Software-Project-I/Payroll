import { Module } from '@nestjs/common';
import { PerformanceController } from '../controllers/Performance-Controller';
import { PerformanceService } from '../services/Performance-Service';
import {OrganizationController} from "../controllers/Organization-Controller";
import {EmployeeController} from "../controllers/Employee-Controller";
import {EmployeeService} from "../services/Employee-Service";
import {OrganizationService} from "../services/Organization-Service";

@Module({

    controllers: [PerformanceController,EmployeeController,OrganizationController],
    providers: [PerformanceService,EmployeeService,OrganizationService],
    exports: [PerformanceService, EmployeeService,OrganizationService],
})
export class CombinedModule {}
