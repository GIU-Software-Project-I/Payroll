import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ApprovalAction,
  ApprovalActionDocument,
} from '../../schemas/payroll-processing/approval.action.schema';
import {
  PayrollItem,
  PayrollItemDocument,
} from '../../schemas/payroll-processing/payroll.item.schema';
import {
  PayrollRun,
  PayrollRunDocument,
} from '../../schemas/payroll-processing/payroll.run.schema';
import { PayrollRunStatus } from '../../dto/payroll-process/run.status.dto';
import { HREventType } from '../../dto/payroll-process/hr.event.type.dto';
import {
  ApprovalActionType,
  SigningBonusReviewDto,
  TerminationBenefitsReviewDto,
  ResignationBenefitsReviewDto,
  SigningBonusEditDto,
  TerminationBenefitsEditDto,
  ResignationBenefitsEditDto,
} from '../../dto/payroll-process/approval.action.dto';

@Injectable()
export class PayrollProcessingService {
  constructor(
    @InjectModel(ApprovalAction.name)
    private readonly approvalActionModel: Model<ApprovalActionDocument>,
    @InjectModel(PayrollItem.name)
    private readonly payrollItemModel: Model<PayrollItemDocument>,
    @InjectModel(PayrollRun.name)
    private readonly payrollRunModel: Model<PayrollRunDocument>,
  ) {}

  // ============== REVIEW / APPROVAL ==============

  async reviewSigningBonus(
    runId: string,
    dto: SigningBonusReviewDto,
  ): Promise<ApprovalActionDocument> {
    const run = await this.ensureRunExists(runId);

    const action = dto.approve
      ? ApprovalActionType.SIGNING_BONUS_APPROVE
      : ApprovalActionType.SIGNING_BONUS_REJECT;

    return this.approvalActionModel.create({
      payrollRunId: run._id,
      actorId: new Types.ObjectId(dto.actorId),
      actorRole: dto.actorRole,
      action,
      reason: dto.reason,
    });
  }

  async reviewTerminationBenefits(
    runId: string,
    dto: TerminationBenefitsReviewDto,
  ): Promise<ApprovalActionDocument> {
    const run = await this.ensureRunExists(runId);

    // Only make sense if there are termination items in this run
    const hasTerminationItems = await this.payrollItemModel.exists({
      payrollRunId: run._id,
      hrEventType: HREventType.TERMINATION,
    });

    if (!hasTerminationItems) {
      throw new BadRequestException('No termination items found for this payroll run.');
    }

    const action = dto.approve
      ? ApprovalActionType.TERMINATION_BENEFITS_APPROVE
      : ApprovalActionType.TERMINATION_BENEFITS_REJECT;

    return this.approvalActionModel.create({
      payrollRunId: run._id,
      actorId: new Types.ObjectId(dto.actorId),
      actorRole: dto.actorRole,
      action,
      reason: dto.reason,
    });
  }

  async reviewResignationBenefits(
    runId: string,
    dto: ResignationBenefitsReviewDto,
  ): Promise<ApprovalActionDocument> {
    const run = await this.ensureRunExists(runId);

    const hasResignationItems = await this.payrollItemModel.exists({
      payrollRunId: run._id,
      hrEventType: HREventType.RESIGNATION,
    });

    if (!hasResignationItems) {
      throw new BadRequestException('No resignation items found for this payroll run.');
    }

    const action = dto.approve
      ? ApprovalActionType.RESIGNATION_BENEFITS_APPROVE
      : ApprovalActionType.RESIGNATION_BENEFITS_REJECT;

    return this.approvalActionModel.create({
      payrollRunId: run._id,
      actorId: new Types.ObjectId(dto.actorId),
      actorRole: dto.actorRole,
      action,
      reason: dto.reason,
    });
  }

  // ============== EDIT AMOUNTS ==============

  async editSigningBonus(
    payrollItemId: string,
    dto: SigningBonusEditDto,
  ): Promise<PayrollItemDocument> {
    const item = await this.ensurePayrollItemExists(payrollItemId);

    item.signingBonusAmount = dto.newAmount;
    return item.save();
  }

  async editTerminationBenefits(
    payrollItemId: string,
    dto: TerminationBenefitsEditDto,
  ): Promise<PayrollItemDocument> {
    const item = await this.ensurePayrollItemExists(payrollItemId);

    if (item.hrEventType !== HREventType.TERMINATION) {
      throw new BadRequestException(
        'Termination benefits can only be edited for termination events.',
      );
    }

    item.terminationBenefitsAmount = dto.newAmount;
    return item.save();
  }

  async editResignationBenefits(
    payrollItemId: string,
    dto: ResignationBenefitsEditDto,
  ): Promise<PayrollItemDocument> {
    const item = await this.ensurePayrollItemExists(payrollItemId);

    if (item.hrEventType !== HREventType.RESIGNATION) {
      throw new BadRequestException(
        'Resignation benefits can only be edited for resignation events.',
      );
    }

    item.resignationBenefitsAmount = dto.newAmount;
    return item.save();
  }

  // ============== PAYROLL INITIATION GATE ==============

  /**
   * Initiates a payroll run, but only if all required reviews are completed:
   * - Signing bonus review, if any signing bonuses exist in the run.
   * - Termination benefits review, if any termination items exist.
   * - Resignation benefits review, if any resignation items exist.
   */
  async initiatePayrollRun(runId: string): Promise<PayrollRunDocument> {
    const run = await this.ensureRunExists(runId);

    if (run.status !== PayrollRunStatus.PRE_RUN) {
      throw new BadRequestException(
        `Payroll run must be in PRE_RUN status to be initiated (current: ${run.status}).`,
      );
    }

    const items = await this.payrollItemModel.find({ payrollRunId: run._id });

    if (!items.length) {
      throw new BadRequestException('Payroll run has no items to process.');
    }

    const needsSigningBonusReview = items.some(
      (i) => i.signingBonusAmount && i.signingBonusAmount > 0,
    );

    const needsTerminationReview = items.some((i) => i.hrEventType === HREventType.TERMINATION);

    const needsResignationReview = items.some((i) => i.hrEventType === HREventType.RESIGNATION);

    // Check existence of the necessary approval actions
    if (needsSigningBonusReview) {
      const hasSigningBonusReview = await this.approvalActionModel.exists({
        payrollRunId: run._id,
        action: {
          $in: [ApprovalActionType.SIGNING_BONUS_APPROVE, ApprovalActionType.SIGNING_BONUS_REJECT],
        },
      });

      if (!hasSigningBonusReview) {
        throw new BadRequestException(
          'Signing bonus review (approve or reject) is required before initiating this payroll run.',
        );
      }
    }

    if (needsTerminationReview) {
      const hasTerminationReview = await this.approvalActionModel.exists({
        payrollRunId: run._id,
        action: {
          $in: [
            ApprovalActionType.TERMINATION_BENEFITS_APPROVE,
            ApprovalActionType.TERMINATION_BENEFITS_REJECT,
          ],
        },
      });

      if (!hasTerminationReview) {
        throw new BadRequestException(
          'Termination benefits review (approve or reject) is required before initiating this payroll run.',
        );
      }
    }

    if (needsResignationReview) {
      const hasResignationReview = await this.approvalActionModel.exists({
        payrollRunId: run._id,
        action: {
          $in: [
            ApprovalActionType.RESIGNATION_BENEFITS_APPROVE,
            ApprovalActionType.RESIGNATION_BENEFITS_REJECT,
          ],
        },
      });

      if (!hasResignationReview) {
        throw new BadRequestException(
          'Resignation benefits review (approve or reject) is required before initiating this payroll run.',
        );
      }
    }

    run.status = PayrollRunStatus.INITIATED;
    return run.save();
  }

  // ============== HELPERS ==============

  private async ensureRunExists(runId: string): Promise<PayrollRunDocument> {
    const run = await this.payrollRunModel.findById(runId);
    if (!run) {
      throw new NotFoundException('Payroll run not found.');
    }
    return run;
  }

  private async ensurePayrollItemExists(payrollItemId: string): Promise<PayrollItemDocument> {
    const item = await this.payrollItemModel.findById(payrollItemId);
    if (!item) {
      throw new NotFoundException('Payroll item not found.');
    }
    return item;
  }
}
