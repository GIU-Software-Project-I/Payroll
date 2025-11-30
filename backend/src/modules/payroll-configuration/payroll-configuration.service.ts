import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { payrollPolicies, payrollPoliciesDocument } from '../../schemas/payroll-configuration/payrollPolicies.schema';
import { CreatePayrollPolicyDto } from './dto/create-payroll-policy.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
import { QueryPayrollPolicyDto } from './dto/query-payroll-policy.dto';
import { ConfigStatus } from '../../enums/payroll-configuration/payroll-configuration-enums';

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(payrollPolicies.name)
    private payrollPolicyModel: Model<payrollPoliciesDocument>,
  ) {}

  async create(createDto: CreatePayrollPolicyDto): Promise<payrollPolicies> {
    const newPolicy = new this.payrollPolicyModel({
      ...createDto,
      status: ConfigStatus.DRAFT,
      effectiveDate: new Date(createDto.effectiveDate),
    });
    return await newPolicy.save();
  }

  async findAll(queryDto: QueryPayrollPolicyDto): Promise<{
    data: payrollPolicies[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    const query: any = {};

    if (filters.policyType) query.policyType = filters.policyType;
    if (filters.status) query.status = filters.status;
    if (filters.applicability) query.applicability = filters.applicability;
    if (filters.createdByEmployeeId) query.createdByEmployeeId = filters.createdByEmployeeId;

    if (search) {
      query.$or = [
        { policyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.payrollPolicyModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.payrollPolicyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<payrollPolicies> {
    const policy = await this.payrollPolicyModel.findById(id).exec();
    if (!policy) {
      throw new NotFoundException(`Payroll policy with ID ${id} not found`);
    }
    return policy;
  }

  async update(id: string, updateDto: UpdatePayrollPolicyDto): Promise<payrollPolicies> {
    const policy = await this.findOne(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot update policy with status '${policy.status}'. Only DRAFT policies can be edited.`
      );
    }

    const updateData: any = { ...updateDto };
    if (updateDto.effectiveDate) {
      updateData.effectiveDate = new Date(updateDto.effectiveDate);
    }

    const updatedPolicy = await this.payrollPolicyModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    return updatedPolicy as payrollPolicies;
  }

  async remove(id: string): Promise<{ message: string }> {
    const policy = await this.findOne(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot delete policy with status '${policy.status}'. Only DRAFT policies can be deleted.`
      );
    }

    await this.payrollPolicyModel.findByIdAndDelete(id).exec();
    return { message: `Payroll policy '${policy.policyName}' has been successfully deleted` };
  }

  async approve(id: string, approvedBy: string): Promise<payrollPolicies> {
    const policy = await this.findOne(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot approve policy with status '${policy.status}'. Only DRAFT policies can be approved.`
      );
    }

    const approvedPolicy = await this.payrollPolicyModel
      .findByIdAndUpdate(
        id,
        {
          status: ConfigStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        },
        { new: true }
      )
      .exec();
    return approvedPolicy as payrollPolicies;
  }

  async reject(id: string, approvedBy: string): Promise<payrollPolicies> {
    const policy = await this.findOne(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot reject policy with status '${policy.status}'. Only DRAFT policies can be rejected.`
      );
    }

    const rejectedPolicy = await this.payrollPolicyModel
      .findByIdAndUpdate(
        id,
        {
          status: ConfigStatus.REJECTED,
          approvedBy,
          approvedAt: new Date(),
        },
        { new: true }
      )
      .exec();
    return rejectedPolicy as payrollPolicies;
  }
}