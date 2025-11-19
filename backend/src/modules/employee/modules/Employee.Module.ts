import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceController } from "../controllers/Performance-Controller";
import { EmployeeController } from "../controllers/Employee-Controller";
import { OrganizationController } from "../controllers/Organization-Controller";
import { PerformanceService } from "../services/Performance-Service";
import { EmployeeService } from "../services/Employee-Service";
import { OrganizationService } from "../services/Organization-Service";

// Employee schemas
import { User, UserSchema } from '../models/Employee/User.schema';
import { Manager, ManagerSchema } from '../models/Employee/Manager.schema';
import { Employee, EmployeeSchema } from '../models/Employee/Employee.schema';
import { HR, HRSchema } from '../models/Employee/HR.schema';
import { Candidate, CandidateSchema } from '../models/Employee/Candidate.Schema';
import { EmployeeChangeRequest, EmployeeChangeRequestSchema } from '../models/Employee/Employee-Request-Change.schema';

// Organization schemas
import { Department, DepartmentSchema } from '../models/Organization/department.schema';
import { Position, PositionSchema } from '../models/Organization/position';
import { PositionHistory, PositionHistorySchema } from '../models/Organization/positionhistory';
import { StructureChangeRequest, StructureChangeRequestSchema } from '../models/Organization/structure-changerequest';

// Performance schemas
import { AppraisalTemplate, AppraisalTemplateSchema } from '../models/performance/appraisal-template.schema';
import { AppraisalEvaluation, AppraisalEvaluationSchema } from '../models/performance/appraisal-evaluation.schema';
import { AppraisalDispute, AppraisalDisputeSchema } from '../models/performance/appraisal-dispute.schema';
import { AppraisalCycle, AppraisalCycleSchema } from '../models/performance/appraisal-cycle.schema';
import { AppraisalAssignment, AppraisalAssignmentSchema } from '../models/performance/appraisal-assignment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            // Employee models
            { name: User.name, schema: UserSchema },
            { name: Manager.name, schema: ManagerSchema },
            { name: Employee.name, schema: EmployeeSchema },
            { name: HR.name, schema: HRSchema },
            { name: Candidate.name, schema: CandidateSchema },
            { name: EmployeeChangeRequest.name, schema: EmployeeChangeRequestSchema },

            // Organization models
            { name: Department.name, schema: DepartmentSchema },
            { name: Position.name, schema: PositionSchema },
            { name: PositionHistory.name, schema: PositionHistorySchema },
            { name: StructureChangeRequest.name, schema: StructureChangeRequestSchema },

            // Performance models
            { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
            { name: AppraisalEvaluation.name, schema: AppraisalEvaluationSchema },
            { name: AppraisalDispute.name, schema: AppraisalDisputeSchema },
            { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
            { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
        ])
    ],
    controllers: [PerformanceController, EmployeeController, OrganizationController],
    providers: [PerformanceService, EmployeeService, OrganizationService],
    exports: [PerformanceService, EmployeeService, OrganizationService],
})
export class EmployeeModule {}
