import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Candidate, CandidateSchema } from '../models/Employee/Candidate.Schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../models/Employee/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from '../models/Employee/employee-system-role.schema';
import {
  EmployeeQualification,
  EmployeeQualificationSchema,
} from '../models/Employee/qualification.schema';
import {EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestSchema
} from "../models/Employee/ep-change-request.schema";
import { OrganizationStructureModule } from './organization-structure.module';
import {EmployeeProfileController} from "../controllers/employee-profile.controller";
import {EmployeeProfileService} from "../services/employee-profile.service";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
      {name: EmployeeProfileChangeRequest.name, schema: EmployeeProfileChangeRequestSchema},

    ]),
    OrganizationStructureModule,
  ],
  controllers: [EmployeeProfileController ],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService],
})
export class EmployeeModule {}

