import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";

import {LeavesService} from "../services/leaves.service";
import {LeaveRequest, LeaveRequestSchema} from "../models/leave-request.schema";
import {LeavePolicy, LeavePolicySchema} from "../models/leave-policy.schema";
import {LeaveEntitlement, LeaveEntitlementSchema} from "../models/leave-entitlement.schema";
import {LeaveCategory, LeaveCategorySchema} from "../models/leave-category.schema";
import {LeaveAdjustment, LeaveAdjustmentSchema} from "../models/leave-adjustment.schema";
import {Calendar, CalendarSchema} from "../models/calendar.schema";
import {Attachment, AttachmentSchema} from "../models/attachment.schema";
import {LeavesController} from "../controllers/leaves.controller";
import {LeaveType, LeaveTypeSchema} from "../models/leave-type.schema";
import {EmployeeModule} from "../../employee/modules/employee.module";


@Module({
  imports:[MongooseModule.forFeature([{name:LeaveType.name,schema:LeaveTypeSchema},
    {name:LeaveRequest.name, schema: LeaveRequestSchema},
    {name:LeavePolicy.name, schema:LeavePolicySchema},
    {name:LeaveEntitlement.name, schema:LeaveEntitlementSchema},
    {name: LeaveCategory.name, schema:LeaveCategorySchema},
    {name: LeaveAdjustment.name, schema:LeaveAdjustmentSchema},
    {name:Calendar.name, schema:CalendarSchema},
    {name:Attachment.name, schema: AttachmentSchema}
  ]),
      EmployeeModule,
      // TimeManagementModule
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports:[LeavesService]
})
export class LeavesModule {}
