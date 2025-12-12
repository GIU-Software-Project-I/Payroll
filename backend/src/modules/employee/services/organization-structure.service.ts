import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  ApprovalDecision,
  ChangeLogAction,
  StructureRequestStatus,
} from '../enums/organization-structure.enums';
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
import {
  Department,
  DepartmentDocument,
} from '../models/organization-structure/department.schema';
import {
  Position,
  PositionDocument,
} from '../models/organization-structure/position.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from '../models/organization-structure/position-assignment.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from '../models/organization-structure/structure-change-request.schema';
import {
  StructureApproval,
  StructureApprovalDocument,
} from '../models/organization-structure/structure-approval.schema';
import {
  StructureChangeLog,
  StructureChangeLogDocument,
} from '../models/organization-structure/structure-change-log.schema';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,
    @InjectModel(PositionAssignment.name)
    private readonly assignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(StructureChangeRequest.name)
    private readonly changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(StructureApproval.name)
    private readonly approvalModel: Model<StructureApprovalDocument>,
    @InjectModel(StructureChangeLog.name)
    private readonly changeLogModel: Model<StructureChangeLogDocument>,
  ) {}

  //#region Departments
  async createDepartment(dto: CreateDepartmentDto) {
    await this.ensureDepartmentCodeIsUnique(dto.code);
    const department = await this.departmentModel.create(dto);
    await this.logStructureChange({
      action: ChangeLogAction.CREATED,
      entity: Department.name,
      entityId: department._id,
      after: department.toObject(),
    });
    return department;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    const department = await this.departmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    await this.logStructureChange({
      action: ChangeLogAction.UPDATED,
      entity: Department.name,
      entityId: department._id as Types.ObjectId,
      after: department,
    });
    return department;
  }

  async listDepartments(filter?: FilterQuery<DepartmentDocument>) {
    return this.departmentModel.find(filter ?? {}).lean();
  }
  //#endregion

  //#region Positions
  async createPosition(dto: CreatePositionDto) {
    await this.ensurePositionCodeIsUnique(dto.code);
    await this.ensureDepartmentExists(dto.departmentId);
    const position = await this.positionModel.create(dto);
    await this.logStructureChange({
      action: ChangeLogAction.CREATED,
      entity: Position.name,
      entityId: position._id,
      after: position.toObject(),
    });
    return position;
  }

  async updatePosition(id: string, dto: UpdatePositionDto) {
    if (dto.departmentId) {
      await this.ensureDepartmentExists(dto.departmentId);
    }
    const position = await this.positionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    await this.logStructureChange({
      action: ChangeLogAction.UPDATED,
      entity: Position.name,
      entityId: position._id as Types.ObjectId,
      after: position,
    });
    return position;
  }

  async deactivatePosition(id: string, reason?: string) {
    const position = await this.positionModel
      .findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      )
      .lean();
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    await this.assignmentModel.updateMany(
      { positionId: position._id, endDate: { $exists: false } },
      { endDate: new Date(), notes: reason },
    );

    await this.logStructureChange({
      action: ChangeLogAction.DEACTIVATED,
      entity: Position.name,
      entityId: position._id as Types.ObjectId,
      summary: reason,
      after: position,
    });
    return position;
  }

  async listPositions(filter?: FilterQuery<PositionDocument>) {
    return this.positionModel.find(filter ?? {}).lean();
  }
  //#endregion

  //#region Assignments
  async assignPosition(dto: AssignPositionDto) {
    const position = await this.positionModel.findById(dto.positionId).lean();
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    if (!position.isActive) {
      throw new BadRequestException('Position is not active');
    }

    await this.assignmentModel.updateMany(
      {
        employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
        endDate: { $exists: false },
      },
      { endDate: new Date(dto.startDate), notes: 'Superseded by new assignment' },
    );

    const assignment = await this.assignmentModel.create({
      ...dto,
      departmentId: dto.departmentId ?? position.departmentId,
    });

    await this.logStructureChange({
      action: ChangeLogAction.REASSIGNED,
      entity: PositionAssignment.name,
      entityId: assignment._id,
      after: assignment.toObject(),
    });
    return assignment;
  }

  async endAssignment(id: string, dto: EndAssignmentDto) {
    const assignment = await this.assignmentModel
      .findByIdAndUpdate(
        id,
        { endDate: new Date(dto.endDate), notes: dto.notes },
        { new: true },
      )
      .lean();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }
  //#endregion

  //#region Requests & Approvals
  async submitStructureRequest(dto: SubmitStructureRequestDto) {
    const requestNumber = dto.requestNumber ?? this.generateRequestNumber();
    if (dto.targetDepartmentId) {
      await this.ensureDepartmentExists(dto.targetDepartmentId);
    }
    if (dto.targetPositionId) {
      await this.ensurePositionExists(dto.targetPositionId);
    }
    const request = await this.changeRequestModel.create({
      ...dto,
      requestNumber,
      status: StructureRequestStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedByEmployeeId: dto.requestedByEmployeeId,
    });

    await this.logStructureChange({
      action: ChangeLogAction.CREATED,
      entity: StructureChangeRequest.name,
      entityId: request._id,
      after: request.toObject(),
    });

    return request;
  }

  async updateStructureRequest(id: string, dto: UpdateStructureRequestDto) {
    const request = await this.changeRequestModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!request) {
      throw new NotFoundException('Structure change request not found');
    }
    return request;
  }

  async recordApproval(
    changeRequestId: string,
    dto: SubmitApprovalDecisionDto,
  ) {
    const changeRequest = await this.changeRequestModel
      .findById(changeRequestId)
      .lean();
    if (!changeRequest) {
      throw new NotFoundException('Structure change request not found');
    }

    const approval = await this.approvalModel.create({
      ...dto,
      changeRequestId,
      decidedAt: new Date(),
    });

    if (dto.decision === ApprovalDecision.APPROVED) {
      await this.changeRequestModel.findByIdAndUpdate(changeRequestId, {
        status: StructureRequestStatus.APPROVED,
      });
    } else if (dto.decision === ApprovalDecision.REJECTED) {
      await this.changeRequestModel.findByIdAndUpdate(changeRequestId, {
        status: StructureRequestStatus.REJECTED,
      });
    }

    await this.logStructureChange({
      action: ChangeLogAction.UPDATED,
      entity: StructureApproval.name,
      entityId: approval._id,
      after: approval.toObject(),
    });

    return approval;
  }
  //#endregion

  //#region Hierarchy query helpers
  async getDepartmentHierarchy(departmentId: string) {
    await this.ensureDepartmentExists(departmentId);
    const positions = await this.positionModel
      .find({ departmentId })
      .lean();
    const assignments = await this.assignmentModel
      .find({ departmentId, endDate: { $exists: false } })
      .lean();
    return { positions, assignments };
  }
  //#endregion

  private async ensureDepartmentCodeIsUnique(code: string) {
    const exists = await this.departmentModel.exists({ code });
    if (exists) {
      throw new ConflictException('Department code already exists');
    }
  }

  private async ensurePositionCodeIsUnique(code: string) {
    const exists = await this.positionModel.exists({ code });
    if (exists) {
      throw new ConflictException('Position code already exists');
    }
  }

  private async ensureDepartmentExists(id: string) {
    const exists = await this.departmentModel.exists({
      _id: new Types.ObjectId(id),
    });
    if (!exists) {
      throw new NotFoundException('Department not found');
    }
  }

  private async ensurePositionExists(id: string) {
    const exists = await this.positionModel.exists({
      _id: new Types.ObjectId(id),
    });
    if (!exists) {
      throw new NotFoundException('Position not found');
    }
  }

  private generateRequestNumber() {
    return `REQ-${Date.now().toString(36).toUpperCase()}`;
  }

  private async logStructureChange({
    action,
    entity,
    entityId,
    summary,
    before,
    after,
  }: {
    action: ChangeLogAction;
    entity: string;
    entityId: Types.ObjectId;
    summary?: string;
    before?: unknown;
    after?: unknown;
  }) {
    await this.changeLogModel.create({
      action,
      entityType: entity,
      entityId,
      summary,
      beforeSnapshot: before,
      afterSnapshot: after,
    });
  }
}
