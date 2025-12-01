import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  AssignPositionDto,
  CreateDepartmentDto,
  CreatePositionDto,
  EndAssignmentDto,
  SubmitApprovalDecisionDto,
  SubmitStructureRequestDto,
  UpdateDepartmentDto,
  UpdatePositionDto,
  UpdateStructureRequestDto,
} from '../dto/organization-structure';
import { OrganizationStructureService } from '../services/organization-structure.service';

@Controller('organization-structure')
//@UsePipes(new ValidationPipe({whitelist: true, transform: true,}),)

export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
  ) {}

  //#region Departments
  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationStructureService.createDepartment(dto);
  }

  @Get('departments')
  listDepartments(@Query('isActive') isActive?: string) {
    const filter =
      typeof isActive === 'string'
        ? { isActive: isActive.toLowerCase() === 'true' }
        : undefined;
    return this.organizationStructureService.listDepartments(filter);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.organizationStructureService.updateDepartment(id, dto);
  }
  //#endregion

  //#region Positions
  @Post('positions')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.organizationStructureService.createPosition(dto);
  }

  @Get('positions')
  listPositions(@Query('departmentId') departmentId?: string) {
    const filter = departmentId ? { departmentId } : undefined;
    return this.organizationStructureService.listPositions(filter);
  }

  @Patch('positions/:id')
  updatePosition(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.organizationStructureService.updatePosition(id, dto);
  }

  @Patch('positions/:id/deactivate')
  deactivatePosition(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.organizationStructureService.deactivatePosition(id, reason);
  }
  //#endregion

  //#region Assignments
  @Post('assignments')
  assignPosition(@Body() dto: AssignPositionDto) {
    return this.organizationStructureService.assignPosition(dto);
  }

  @Patch('assignments/:id/end')
  endAssignment(@Param('id') id: string, @Body() dto: EndAssignmentDto) {
    return this.organizationStructureService.endAssignment(id, dto);
  }
  //#endregion

  //#region Requests & approvals
  @Post('requests')
  submitRequest(@Body() dto: SubmitStructureRequestDto) {
    return this.organizationStructureService.submitStructureRequest(dto);
  }

  @Patch('requests/:id')
  updateRequest(
    @Param('id') id: string,
    @Body() dto: UpdateStructureRequestDto,
  ) {
    return this.organizationStructureService.updateStructureRequest(id, dto);
  }

  @Post('requests/:id/approvals')
  recordApproval(
    @Param('id') id: string,
    @Body() dto: SubmitApprovalDecisionDto,
  ) {
    return this.organizationStructureService.recordApproval(id, dto);
  }
  //#endregion

  @Get('departments/:id/hierarchy')
  getDepartmentHierarchy(@Param('id') id: string) {
    return this.organizationStructureService.getDepartmentHierarchy(id);
  }
}
