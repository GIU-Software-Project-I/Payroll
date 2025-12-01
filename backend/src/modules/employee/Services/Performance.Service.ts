import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';

import {
  AppraisalTemplate,
  AppraisalTemplateDocument,
} from '../models/performance/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleDocument,
} from '../models/performance/appraisal-cycle.schema';
import {
  AppraisalAssignment,
  AppraisalAssignmentDocument,
} from '../models/performance/appraisal-assignment.schema';
import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from '../models/performance/appraisal-record.schema';
import {
  AppraisalDispute,
  AppraisalDisputeDocument,
} from '../models/performance/appraisal-dispute.schema';

import {
  AppraisalCycleStatus,
  AppraisalAssignmentStatus,
  AppraisalRecordStatus,
  AppraisalDisputeStatus,
} from '../enums/performance.enums';
import {CreateAppraisalTemplateDto, UpdateAppraisalTemplateDto} from "../dto/performance/appraisal-template.dto";
import {CreateAppraisalCycleDto, UpdateAppraisalCycleDto} from "../dto/performance/appraisal-cycle.dto";
import {
    BulkCreateAppraisalAssignmentDto,
    CreateAppraisalAssignmentDto
} from "../dto/performance/appraisal-assignment.dto";
import {SubmitAppraisalRecordDto} from "../dto/performance/appraisal-record.dto";
import {FileAppraisalDisputeDto, ResolveAppraisalDisputeDto} from "../dto/performance/appraisal-dispute.dto";



@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private appraisalTemplateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name)
    private appraisalCycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalAssignment.name)
    private appraisalAssignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalRecord.name)
    private appraisalRecordModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalDispute.name)
    private appraisalDisputeModel: Model<AppraisalDisputeDocument>,
  ) {}

  // ============ PHASE 1: TEMPLATE DEFINITION ============

  /**
   * REQ-PP-01: Create a standardized appraisal template
   */
  async createTemplate(
    dto: CreateAppraisalTemplateDto,
  ): Promise<AppraisalTemplateDocument> {
    const existingTemplate = await this.appraisalTemplateModel.findOne({
      name: dto.name,
    });
    if (existingTemplate) {
      throw new ConflictException(
        `Template with name "${dto.name}" already exists`,
      );
    }

    const template = new this.appraisalTemplateModel({
      ...dto,
      applicableDepartmentIds: dto.applicableDepartmentIds?.map(
        (id) => new Types.ObjectId(id),
      ) || [],
      applicablePositionIds: dto.applicablePositionIds?.map(
        (id) => new Types.ObjectId(id),
      ) || [],
      isActive: dto.isActive ?? true,
    });

    return template.save();
  }

  /**
   * Update an appraisal template
   */
  async updateTemplate(
    templateId: string,
    dto: UpdateAppraisalTemplateDto,
  ): Promise<AppraisalTemplateDocument> {
    const template = await this.appraisalTemplateModel.findByIdAndUpdate(
      templateId,
      {
        ...dto,
        applicableDepartmentIds: dto.applicableDepartmentIds?.map(
          (id) => new Types.ObjectId(id),
        ),
        applicablePositionIds: dto.applicablePositionIds?.map(
          (id) => new Types.ObjectId(id),
        ),
      },
      { new: true },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<AppraisalTemplateDocument> {
    const template = await this.appraisalTemplateModel.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }
    return template;
  }

  /**
   * Get all active templates
   */
  async getAllTemplates(
    filter?: any,
  ): Promise<AppraisalTemplateDocument[]> {
    const query: FilterQuery<AppraisalTemplate> = filter || {
      isActive: true,
    };
    return this.appraisalTemplateModel.find(query);
  }

  // ============ PHASE 2: CYCLE CREATION & SETUP ============

  /**
   * REQ-PP-02: Create and schedule an appraisal cycle
   */
  async createCycle(
    dto: CreateAppraisalCycleDto,
  ): Promise<AppraisalCycleDocument> {
    const existingCycle = await this.appraisalCycleModel.findOne({
      name: dto.name,
    });
    if (existingCycle) {
      throw new ConflictException(
        `Cycle with name "${dto.name}" already exists`,
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Start date must be before end date',
      );
    }

    const cycle = new this.appraisalCycleModel({
      ...dto,
      status: AppraisalCycleStatus.PLANNED,
      templateAssignments: dto.templateAssignments || [],
    });

    return cycle.save();
  }

  /**
   * Update an appraisal cycle
   */
  async updateCycle(
    cycleId: string,
    dto: UpdateAppraisalCycleDto,
  ): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${cycleId} not found`);
    }

    if (
      cycle.status !== AppraisalCycleStatus.PLANNED &&
      dto.status !== AppraisalCycleStatus.PLANNED
    ) {
      throw new BadRequestException(
        'Can only update cycles in PLANNED status',
      );
    }

    const updated = await this.appraisalCycleModel.findByIdAndUpdate(
      cycleId,
      dto,
      { new: true },
    );

    return updated!;
  }

  /**
   * Get cycle by ID
   */
  async getCycle(cycleId: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${cycleId} not found`);
    }
    return cycle;
  }

  /**
   * Get all cycles with optional filtering
   */
  async getAllCycles(
    filter?: any,
  ): Promise<AppraisalCycleDocument[]> {
    const query: FilterQuery<AppraisalCycle> = filter || {};
    return this.appraisalCycleModel.find(query);
  }

  /**
   * Activate an appraisal cycle (transition to ACTIVE)
   */
  async activateCycle(cycleId: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${cycleId} not found`);
    }

    if (cycle.status !== AppraisalCycleStatus.PLANNED) {
      throw new BadRequestException(
        'Only PLANNED cycles can be activated',
      );
    }

    cycle.status = AppraisalCycleStatus.ACTIVE;
    return cycle.save();
  }

  /**
   * Close an appraisal cycle (transition to CLOSED)
   */
  async closeCycle(cycleId: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${cycleId} not found`);
    }

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        'Only ACTIVE cycles can be closed',
      );
    }

    cycle.status = AppraisalCycleStatus.CLOSED;
    cycle.closedAt = new Date();
    return cycle.save();
  }

  // ============ PHASE 3A: BULK ASSIGNMENT ============

  /**
   * REQ-PP-05: Create a single appraisal assignment
   */
  async createAssignment(
    dto: CreateAppraisalAssignmentDto,
  ): Promise<AppraisalAssignmentDocument> {
    // Validate cycle exists and is ACTIVE
    const cycle = await this.appraisalCycleModel.findById(dto.cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${dto.cycleId} not found`);
    }

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        'Assignments can only be created for ACTIVE cycles',
      );
    }

    // Validate template exists
    const template = await this.appraisalTemplateModel.findById(
      dto.templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
    }

    // Check for duplicate assignment
    const existing = await this.appraisalAssignmentModel.findOne({
      cycleId: new Types.ObjectId(dto.cycleId),
      employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
      templateId: new Types.ObjectId(dto.templateId),
    });

    if (existing) {
      throw new ConflictException(
        'An assignment already exists for this employee in this cycle',
      );
    }

    const assignment = new this.appraisalAssignmentModel({
      cycleId: new Types.ObjectId(dto.cycleId),
      templateId: new Types.ObjectId(dto.templateId),
      employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
      managerProfileId: new Types.ObjectId(dto.managerProfileId),
      departmentId: new Types.ObjectId(dto.departmentId),
      positionId: dto.positionId
        ? new Types.ObjectId(dto.positionId)
        : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: AppraisalAssignmentStatus.NOT_STARTED,
      assignedAt: new Date(),
    });

    return assignment.save();
  }

  /**
   * REQ-PP-05: Bulk create assignments for multiple employees
   */
  async bulkCreateAssignments(
    dto: BulkCreateAppraisalAssignmentDto,
  ): Promise<AppraisalAssignmentDocument[]> {
    // Validate cycle
    const cycle = await this.appraisalCycleModel.findById(dto.cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${dto.cycleId} not found`);
    }

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        'Assignments can only be created for ACTIVE cycles',
      );
    }

    // Validate template
    const template = await this.appraisalTemplateModel.findById(
      dto.templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
    }

    const assignments = dto.employeeProfileIds.map((employeeId) => ({
      cycleId: new Types.ObjectId(dto.cycleId),
      templateId: new Types.ObjectId(dto.templateId),
      employeeProfileId: new Types.ObjectId(employeeId),
      departmentId: new Types.ObjectId(dto.departmentId),
      managerProfileId: new Types.ObjectId(dto.departmentId), // Placeholder - should come from OS
      status: AppraisalAssignmentStatus.NOT_STARTED,
      assignedAt: new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    }));

    const results = await this.appraisalAssignmentModel.insertMany(assignments);
    return results as any;
  }

  /**
   * Get assignment by ID
   */
  async getAssignment(
    assignmentId: string,
  ): Promise<AppraisalAssignmentDocument> {
    const assignment = await this.appraisalAssignmentModel.findById(
      assignmentId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }
    return assignment;
  }

  /**
   * Get all assignments with optional filtering
   */
  async getAllAssignments(
    filter?: any,
  ): Promise<AppraisalAssignmentDocument[]> {
    const query: FilterQuery<AppraisalAssignment> = filter || {};
    return this.appraisalAssignmentModel.find(query);
  }

  /**
   * REQ-PP-13: Get assignments for a specific manager
   */
  async getAssignmentsForManager(
    managerProfileId: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    return this.appraisalAssignmentModel.find({
      managerProfileId: new Types.ObjectId(managerProfileId),
      status: { $ne: AppraisalAssignmentStatus.PUBLISHED },
    });
  }

  // ============ PHASE 3B: MANAGER EVALUATION ============

  /**
   * REQ-AE-03 & REQ-AE-04: Submit appraisal record with ratings and comments
   */
  async submitAppraisalRecord(
    dto: SubmitAppraisalRecordDto,
  ): Promise<AppraisalRecordDocument> {
    // Validate assignment exists
    const assignment = await this.appraisalAssignmentModel.findById(
      dto.assignmentId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${dto.assignmentId} not found`,
      );
    }

    // Check if record already exists for this assignment
    let record = await this.appraisalRecordModel.findOne({
      assignmentId: new Types.ObjectId(dto.assignmentId),
    });

    if (record && record.status === AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException(
        'Cannot modify a published appraisal record',
      );
    }

    if (!record) {
      // Create new record
      record = new this.appraisalRecordModel({
        assignmentId: new Types.ObjectId(dto.assignmentId),
        cycleId: assignment.cycleId,
        templateId: assignment.templateId,
        employeeProfileId: assignment.employeeProfileId,
        managerProfileId: assignment.managerProfileId,
        ratings: dto.ratings,
        totalScore: dto.totalScore,
        overallRatingLabel: dto.overallRatingLabel,
        managerSummary: dto.managerSummary,
        strengths: dto.strengths,
        improvementAreas: dto.improvementAreas,
        status: AppraisalRecordStatus.MANAGER_SUBMITTED,
        managerSubmittedAt: new Date(),
      });
    } else {
      // Update existing record
      record.ratings = dto.ratings;
      record.totalScore = dto.totalScore;
      record.overallRatingLabel = dto.overallRatingLabel;
      record.managerSummary = dto.managerSummary;
      record.strengths = dto.strengths;
      record.improvementAreas = dto.improvementAreas;
      record.status = AppraisalRecordStatus.MANAGER_SUBMITTED;
      record.managerSubmittedAt = new Date();
    }

    // Update assignment status
    assignment.status = AppraisalAssignmentStatus.SUBMITTED;
    assignment.submittedAt = new Date();
    await assignment.save();

    return record.save();
  }

  /**
   * Get appraisal record by ID
   */
  async getAppraisalRecord(
    recordId: string,
  ): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel.findById(recordId);
    if (!record) {
      throw new NotFoundException(
        `Appraisal record with ID ${recordId} not found`,
      );
    }
    return record;
  }

  /**
   * Get appraisal records for a specific cycle
   */
  async getRecordsByCycle(cycleId: string): Promise<AppraisalRecordDocument[]> {
    return this.appraisalRecordModel.find({
      cycleId: new Types.ObjectId(cycleId),
    });
  }

  // ============ PHASE 4: MONITORING & PUBLICATION ============

  /**
   * REQ-AE-10: Get appraisal completion dashboard data
   */
  async getCompletionDashboard(cycleId: string): Promise<any> {
    const assignments = await this.appraisalAssignmentModel.aggregate([
      { $match: { cycleId: new Types.ObjectId(cycleId) } },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          notStarted: {
            $sum: {
              $cond: [
                { $eq: ['$status', AppraisalAssignmentStatus.NOT_STARTED] },
                1,
                0,
              ],
            },
          },
          inProgress: {
            $sum: {
              $cond: [
                { $eq: ['$status', AppraisalAssignmentStatus.IN_PROGRESS] },
                1,
                0,
              ],
            },
          },
          submitted: {
            $sum: {
              $cond: [
                { $eq: ['$status', AppraisalAssignmentStatus.SUBMITTED] },
                1,
                0,
              ],
            },
          },
          published: {
            $sum: {
              $cond: [
                { $eq: ['$status', AppraisalAssignmentStatus.PUBLISHED] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          departmentId: '$_id',
          total: 1,
          notStarted: 1,
          inProgress: 1,
          submitted: 1,
          published: 1,
          completionPercentage: {
            $multiply: [
              { $divide: ['$published', '$total'] },
              100,
            ],
          },
          _id: 0,
        },
      },
    ]);

    return {
      cycle: await this.getCycle(cycleId),
      departmentMetrics: assignments,
    };
  }

  /**
   * REQ-AE-06: Get pending appraisals for a manager
   */
  async getPendingAppraisesByManager(
    managerProfileId: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    return this.appraisalAssignmentModel.find({
      managerProfileId: new Types.ObjectId(managerProfileId),
      status: {
        $in: [
          AppraisalAssignmentStatus.NOT_STARTED,
          AppraisalAssignmentStatus.IN_PROGRESS,
        ],
      },
    });
  }

  /**
   * REQ-AE-06: Publish appraisal records to employees
   */
  async publishAppraisalRecord(
    recordId: string,
    publishedByEmployeeId: string,
  ): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel.findById(recordId);
    if (!record) {
      throw new NotFoundException(
        `Appraisal record with ID ${recordId} not found`,
      );
    }

    if (record.status !== AppraisalRecordStatus.MANAGER_SUBMITTED) {
      throw new BadRequestException(
        'Only MANAGER_SUBMITTED records can be published',
      );
    }

    record.status = AppraisalRecordStatus.HR_PUBLISHED;
    record.hrPublishedAt = new Date();
    record.publishedByEmployeeId = new Types.ObjectId(publishedByEmployeeId);

    const updated = await record.save();

    // Update assignment status
    const assignment = await this.appraisalAssignmentModel.findById(
      record.assignmentId,
    );
    if (assignment) {
      assignment.status = AppraisalAssignmentStatus.PUBLISHED;
      assignment.publishedAt = new Date();
      await assignment.save();
    }

    return updated;
  }

  // ============ PHASE 5: EMPLOYEE FEEDBACK ============

  /**
   * REQ-OD-01: Employee acknowledges appraisal record
   */
  async acknowledgeAppraisal(
    recordId: string,
    acknowledgementComment?: string,
  ): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel.findById(recordId);
    if (!record) {
      throw new NotFoundException(
        `Appraisal record with ID ${recordId} not found`,
      );
    }

    if (record.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException(
        'Only HR_PUBLISHED records can be acknowledged',
      );
    }

    record.status = AppraisalRecordStatus.ARCHIVED;
    record.employeeViewedAt = new Date();
    record.employeeAcknowledgedAt = new Date();
    record.employeeAcknowledgementComment = acknowledgementComment;

    const updated = await record.save();

    // Update assignment status
    const assignment = await this.appraisalAssignmentModel.findById(
      record.assignmentId,
    );
    if (assignment) {
      assignment.status = AppraisalAssignmentStatus.ACKNOWLEDGED;
      await assignment.save();
    }

    return updated;
  }

  // ============ PHASE 6 & 7: DISPUTES ============

  /**
   * REQ-AE-07: Employee files a dispute/objection
   */
  async fileDispute(
    dto: FileAppraisalDisputeDto,
  ): Promise<AppraisalDisputeDocument> {
    // Validate appraisal record exists and is published
    const record = await this.appraisalRecordModel.findById(dto.appraisalId);
    if (!record) {
      throw new NotFoundException(
        `Appraisal record with ID ${dto.appraisalId} not found`,
      );
    }

    if (record.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException(
        'Disputes can only be filed for published appraisals',
      );
    }

    // Check if dispute window is still open (7 days from publication)
    const publishDate = record.hrPublishedAt
      ? new Date(record.hrPublishedAt)
      : new Date();
    const disputeWindowClosesAt = new Date(
      publishDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    if (new Date() > disputeWindowClosesAt) {
      throw new BadRequestException(
        'Dispute window has closed (7 days after publication)',
      );
    }

    // Check for duplicate dispute
    const existing = await this.appraisalDisputeModel.findOne({
      appraisalId: new Types.ObjectId(dto.appraisalId),
      raisedByEmployeeId: new Types.ObjectId(dto.raisedByEmployeeId),
      status: { $in: [AppraisalDisputeStatus.OPEN, AppraisalDisputeStatus.UNDER_REVIEW] },
    });

    if (existing) {
      throw new ConflictException(
        'A dispute is already open for this appraisal',
      );
    }

    const dispute = new this.appraisalDisputeModel({
      appraisalId: new Types.ObjectId(dto.appraisalId),
      assignmentId: new Types.ObjectId(dto.assignmentId),
      cycleId: new Types.ObjectId(dto.cycleId),
      raisedByEmployeeId: new Types.ObjectId(dto.raisedByEmployeeId),
      reason: dto.reason,
      details: dto.details,
      submittedAt: new Date(),
      status: AppraisalDisputeStatus.OPEN,
    });

    return dispute.save();
  }

  /**
   * REQ-OD-07: HR Manager resolves a dispute
   */
  async resolveDispute(
    dto: ResolveAppraisalDisputeDto,
  ): Promise<AppraisalDisputeDocument> {
    const dispute = await this.appraisalDisputeModel.findById(dto.disputeId);
    if (!dispute) {
      throw new NotFoundException(
        `Dispute with ID ${dto.disputeId} not found`,
      );
    }

    if (dispute.status === AppraisalDisputeStatus.REJECTED ||
        dispute.status === AppraisalDisputeStatus.ADJUSTED) {
      throw new BadRequestException(
        'Dispute has already been resolved',
      );
    }

    dispute.status = dto.status as AppraisalDisputeStatus;
    dispute.resolutionSummary = dto.resolutionSummary;
    dispute.resolvedByEmployeeId = new Types.ObjectId(
      dto.resolvedByEmployeeId,
    );
    dispute.resolvedAt = new Date();

    return dispute.save();
  }

  /**
   * Get dispute by ID
   */
  async getDispute(disputeId: string): Promise<AppraisalDisputeDocument> {
    const dispute = await this.appraisalDisputeModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException(
        `Dispute with ID ${disputeId} not found`,
      );
    }
    return dispute;
  }

  /**
   * Get all disputes for a cycle
   */
  async getDisputesByCycle(cycleId: string): Promise<AppraisalDisputeDocument[]> {
    return this.appraisalDisputeModel.find({
      cycleId: new Types.ObjectId(cycleId),
    });
  }

  // ============ PHASE 8: ARCHIVING ============

  /**
   * Archive completed appraisal cycles (scheduled task)
   */
  @Cron('0 0 * * *') // Runs daily at midnight
  async archiveCompletedCycles(): Promise<void> {
    const now = new Date();
    const closedCycles = await this.appraisalCycleModel.find({
      status: AppraisalCycleStatus.CLOSED,
      archivedAt: { $exists: false },
      closedAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // At least 1 day old
    });

    for (const cycle of closedCycles) {
      cycle.status = AppraisalCycleStatus.ARCHIVED;
      cycle.archivedAt = new Date();
      await cycle.save();

      // Archive all associated records
      await this.appraisalRecordModel.updateMany(
        { cycleId: cycle._id },
        { archivedAt: new Date() },
      );
    }
  }

  /**
   * Manually archive a completed cycle
   */
  async archiveCycle(cycleId: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${cycleId} not found`);
    }

    if (cycle.status !== AppraisalCycleStatus.CLOSED) {
      throw new BadRequestException('Only CLOSED cycles can be archived');
    }

    cycle.status = AppraisalCycleStatus.ARCHIVED;
    cycle.archivedAt = new Date();
    const updated = await cycle.save();

    // Archive all associated records
    await this.appraisalRecordModel.updateMany(
      { cycleId: cycle._id },
      { archivedAt: new Date() },
    );

    return updated;
  }

  /**
   * Get archived cycles
   */
  async getArchivedCycles(): Promise<AppraisalCycleDocument[]> {
    return this.appraisalCycleModel.find({
      status: AppraisalCycleStatus.ARCHIVED,
    });
  }

  /**
   * Get historical appraisal records for an employee
   */
  async getEmployeeAppraisalHistory(
    employeeProfileId: string,
  ): Promise<AppraisalRecordDocument[]> {
    return this.appraisalRecordModel.find({
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      status: { $in: [AppraisalRecordStatus.HR_PUBLISHED, AppraisalRecordStatus.ARCHIVED] },
    }).sort({ hrPublishedAt: -1 });
  }
}
