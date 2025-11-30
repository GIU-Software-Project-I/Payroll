import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { payrollPolicies, payrollPoliciesDocument } from '../../schemas/payroll-configuration/payrollPolicies.schema';
import { payType, payTypeDocument } from '../../schemas/payroll-configuration/payType.schema';
import { CreatePayrollPolicyDto } from './dto/create-payroll-policy.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
import { QueryPayrollPolicyDto } from './dto/query-payroll-policy.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';
import { QueryPayTypeDto } from './dto/query-pay-type.dto';
import { ConfigStatus } from '../../enums/payroll-configuration/payroll-configuration-enums';


@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(payrollPolicies.name)
    private payrollPolicyModel: Model<payrollPoliciesDocument>,
    @InjectModel(payType.name)
    private payTypeModel: Model<payTypeDocument>,
  ) {}
 // ========== PAYROLL POLICIES METHODS ==========
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
  // ========== PAY TYPES METHODS ==========
  // In payroll-configuration.service.ts - update createPayType method
async createPayType(createDto: CreatePayTypeDto): Promise<payType> {
  // Check if pay type with same type already exists (since type is unique)
  const existingPayType = await this.payTypeModel.findOne({ 
    type: createDto.type 
  }).exec();
  
  if (existingPayType) {
    throw new BadRequestException(`Pay type '${createDto.type}' already exists`);
  }

  // Only include fields that exist in the schema
  const newPayType = new this.payTypeModel({
    type: createDto.type,
    amount: createDto.amount,
    createdByEmployeeId: createDto.createdByEmployeeId,
    status: ConfigStatus.DRAFT,
  });
  
  return await newPayType.save();
}

  async findAllPayTypes(queryDto: QueryPayTypeDto): Promise<{
    data: payType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, status, createdByEmployeeId } = queryDto;
    const query: any = {};

    if (status) query.status = status;
    if (createdByEmployeeId) query.createdByEmployeeId = createdByEmployeeId;

    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.payTypeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.payTypeModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOnePayType(id: string): Promise<payType> {
    const payType = await this.payTypeModel.findById(id).exec();
    if (!payType) {
      throw new NotFoundException(`Pay type with ID ${id} not found`);
    }
    return payType;
  }

  async updatePayType(id: string, updateDto: UpdatePayTypeDto): Promise<payType> {
    const payType = await this.findOnePayType(id);

    if (payType.status !== ConfigStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot update pay type with status '${payType.status}'. Only DRAFT pay types can be edited.`
      );
    }

    if (updateDto.type && updateDto.type !== payType.type) {
      const existing = await this.payTypeModel.findOne({ type: updateDto.type }).exec();
      if (existing) {
        throw new BadRequestException(`Pay type '${updateDto.type}' already exists`);
      }
    }

    const updatedPayType = await this.payTypeModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    return updatedPayType as payType;
  }

  async removePayType(id: string): Promise<{ message: string }> {
    const payType = await this.findOnePayType(id);

    if (payType.status !== ConfigStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot delete pay type with status '${payType.status}'. Only DRAFT pay types can be deleted.`
      );
    }

    await this.payTypeModel.findByIdAndDelete(id).exec();
    return { message: `Pay type '${payType.type}' has been successfully deleted` };
  }

  async approvePayType(id: string, approvedBy: string): Promise<payType> {
    const payType = await this.findOnePayType(id);

    if (payType.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot approve pay type with status '${payType.status}'. Only DRAFT pay types can be approved.`
      );
    }

    const approvedPayType = await this.payTypeModel
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
    return approvedPayType as payType;
  }

  async rejectPayType(id: string, approvedBy: string): Promise<payType> {
    const payType = await this.findOnePayType(id);

    if (payType.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot reject pay type with status '${payType.status}'. Only DRAFT pay types can be rejected.`
      );
    }

    const rejectedPayType = await this.payTypeModel
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
    return rejectedPayType as payType;
  }
}