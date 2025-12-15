import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationLog, NotificationLogSchema } from '../time-management/models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee/models/employee/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from '../employee/models/employee/employee-system-role.schema';
import { Candidate, CandidateSchema } from '../employee/models/employee/Candidate.Schema';
import { AppraisalRecord, AppraisalRecordSchema } from '../employee/models/performance/appraisal-record.schema';
import { AttendanceRecord, AttendanceRecordSchema } from '../time-management/models/attendance-record.schema';
import { LatenessRule, latenessRuleSchema } from '../time-management/models/lateness-rule.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from '../time-management/models/shift-assignment.schema';
import { Shift, ShiftSchema } from '../time-management/models/shift.schema';
import { OvertimeRule, OvertimeRuleSchema } from '../time-management/models/overtime-rule.schema';

import { AuthModule } from '../auth/auth-module';
import { SharedRecruitmentService } from './services/shared-recruitment.service';
import { SharedEmployeeService } from './services/shared-employee.service';
import { SharedOrganizationService } from './services/shared-organization.service';
import { SharedPerformanceService } from './services/shared-performance.service';
import { SharedLeavesService } from './services/shared-leaves.service';
import { SharedPayrollService } from './services/shared-payroll.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: NotificationLog.name, schema: NotificationLogSchema },
            { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
            { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
            { name: Candidate.name, schema: CandidateSchema },
            { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
            { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
            { name: LatenessRule.name, schema: latenessRuleSchema },
            { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
            { name: Shift.name, schema: ShiftSchema },
            { name: OvertimeRule.name, schema: OvertimeRuleSchema },
        ]),
        forwardRef(() => AuthModule),
    ],
    providers: [SharedRecruitmentService, SharedEmployeeService, SharedOrganizationService, SharedPerformanceService, SharedLeavesService, SharedPayrollService],
    exports: [SharedRecruitmentService, SharedEmployeeService, SharedOrganizationService, SharedPerformanceService, SharedLeavesService, SharedPayrollService],
})
export class SharedModule {}
