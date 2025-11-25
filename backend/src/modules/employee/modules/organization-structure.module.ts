import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Department, DepartmentSchema } from '../models/Organization-Structure/department.schema';
import {Position,PositionSchema} from '../models/Organization-Structure/position.schema'
import { PositionAssignmentSchema,PositionAssignment } from '../models/Organization-Structure/position-assignment.schema';
import { StructureApproval,StructureApprovalSchema } from '../models/Organization-Structure/structure-approval.schema';
import { StructureChangeLog,StructureChangeLogSchema } from '../models/Organization-Structure/structure-change-log.schema';
import { StructureChangeRequest,StructureChangeRequestSchema } from '../models/Organization-Structure/structure-change-request.schema';
import {OrganizationStructureController} from "../Controllers/Organization-Structure.Controller";
import {OrganizationStructureService} from "../Services/Organization-Structure.Service";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: PositionAssignment.name, schema: PositionAssignmentSchema },
      { name: StructureApproval.name, schema: StructureApprovalSchema },
      { name: StructureChangeLog.name, schema: StructureChangeLogSchema },
      {name: StructureChangeRequest.name,schema: StructureChangeRequestSchema,},
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService],
  exports: [OrganizationStructureService],
})
export class OrganizationStructureModule {}
