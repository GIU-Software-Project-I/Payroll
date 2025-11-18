import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PreRunAdjustment,
  PreRunAdjustmentDocument,
} from '../../schemas/payroll-processing/pre.run.adjustment.schema';
import {
  CreatePreRunAdjustmentDto,
  PreRunAdjustmentStatus,
  PreRunAdjustmentType,
} from '../../dto/payroll-process/pre.run.adjustment.dto';

@Injectable()
export class PayrollProcessingService {
  constructor(
    @InjectModel(PreRunAdjustment.name)
    private readonly preRunModel: Model<PreRunAdjustmentDocument>,
  ) {}

  async listPendingAdjustments(departmentId?: string, type?: PreRunAdjustmentType) {
    const filter: Record<string, unknown> = { status: PreRunAdjustmentStatus.PENDING };
    if (departmentId) {
      if (!Types.ObjectId.isValid(departmentId)) {
        throw new BadRequestException('Invalid departmentId');
      }
      filter.departmentId = new Types.ObjectId(departmentId);
    }
    if (type) {
      if (!Object.values(PreRunAdjustmentType).includes(type)) {
        throw new BadRequestException('Invalid type');
      }
      filter.type = type;
    }
    return this.preRunModel.find(filter).lean().exec();
  }

  async seedDemoAdjustments(): Promise<number> {
    const count = await this.preRunModel.countDocuments({}).exec();
    if (count > 0) return 0;

    const demo: Partial<PreRunAdjustment>[] = [
      {
        type: PreRunAdjustmentType.SIGNING_BONUS,
        employeeId: new Types.ObjectId(),
        departmentId: new Types.ObjectId(),
        amount: 5000,
        currency: 'EGP',
        status: PreRunAdjustmentStatus.PENDING,
        note: 'New hire signing bonus',
      },
      {
        type: PreRunAdjustmentType.RESIGNATION_BENEFIT,
        employeeId: new Types.ObjectId(),
        departmentId: new Types.ObjectId(),
        amount: 3000,
        currency: 'EGP',
        status: PreRunAdjustmentStatus.PENDING,
        note: 'Resignation settlement',
      },
      {
        type: PreRunAdjustmentType.TERMINATION_BENEFIT,
        employeeId: new Types.ObjectId(),
        departmentId: new Types.ObjectId(),
        amount: 8000,
        currency: 'EGP',
        status: PreRunAdjustmentStatus.PENDING,
        note: 'Termination compensation',
      },
    ];

    const inserted = await this.preRunModel.insertMany(demo);
    return inserted.length;
  }

  async createAdjustment(dto: CreatePreRunAdjustmentDto) {
    return this.preRunModel.create({
      ...dto,
      employeeId: new Types.ObjectId(dto.employeeId),
      departmentId: dto.departmentId ? new Types.ObjectId(dto.departmentId) : undefined,
      status: PreRunAdjustmentStatus.PENDING,
    });
  }

  async approveAdjustment(id: string, actorId?: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const update: Partial<PreRunAdjustment> = {
      status: PreRunAdjustmentStatus.APPROVED,
      approvedBy: actorId && Types.ObjectId.isValid(actorId) ? new Types.ObjectId(actorId) : undefined,
      rejectionReason: undefined,
      rejectedBy: undefined,
    };

    const doc = await this.preRunModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), status: PreRunAdjustmentStatus.PENDING }, update, {
        new: true,
      })
      .exec();
    if (!doc) throw new NotFoundException('Pre-run adjustment not found or not pending');
    return doc;
  }

  async rejectAdjustment(id: string, reason: string, actorId?: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    if (!reason?.trim()) throw new BadRequestException('Reason is required');

    const update: Partial<PreRunAdjustment> = {
      status: PreRunAdjustmentStatus.REJECTED,
      rejectionReason: reason,
      rejectedBy: actorId && Types.ObjectId.isValid(actorId) ? new Types.ObjectId(actorId) : undefined,
      approvedBy: undefined,
    };

    const doc = await this.preRunModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), status: PreRunAdjustmentStatus.PENDING }, update, {
        new: true,
      })
      .exec();
    if (!doc) throw new NotFoundException('Pre-run adjustment not found or not pending');
    return doc;
  }

  async updateAdjustment(id: string, updates: { amount?: number; currency?: string; note?: string }) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');

    const payload: Partial<PreRunAdjustment> = {};
    if (typeof updates.amount === 'number') payload.amount = updates.amount;
    if (typeof updates.currency === 'string') payload.currency = updates.currency;
    if (typeof updates.note === 'string') payload.note = updates.note;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const doc = await this.preRunModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), status: PreRunAdjustmentStatus.PENDING },
        { $set: payload },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Pre-run adjustment not found or not pending');
    return doc;
  }
}
