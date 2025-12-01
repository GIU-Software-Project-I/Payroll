import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { signingBonus, signingBonusDocument } from '../../schemas/payroll-configuration/signingBonus.schema';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';
import { QuerySigningBonusDto } from './dto/query-signing-bonus.dto';
import { payrollPolicies, payrollPoliciesDocument } from '../../schemas/payroll-configuration/payrollPolicies.schema';
import { payType, payTypeDocument } from '../../schemas/payroll-configuration/payType.schema';
import { allowance, allowanceDocument } from '../../schemas/payroll-configuration/allowance.schema';
import { CreatePayrollPolicyDto } from './dto/create-payroll-policy.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
import { QueryPayrollPolicyDto } from './dto/query-payroll-policy.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';
import { QueryPayTypeDto } from './dto/query-pay-type.dto';
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';
import { QueryAllowanceDto } from './dto/query-allowance.dto';
import { ConfigStatus } from '../../enums/payroll-configuration/payroll-configuration-enums';


@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(payrollPolicies.name)
    private payrollPolicyModel: Model<payrollPoliciesDocument>,
    @InjectModel(payType.name)
    private payTypeModel: Model<payTypeDocument>,
    @InjectModel(allowance.name)
    private allowanceModel: Model<allowanceDocument>,
    @InjectModel(signingBonus.name)
private signingBonusModel: Model<signingBonusDocument>,
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
  // ========== ALLOWANCE METHODS ==========
async createAllowance(createDto: CreateAllowanceDto): Promise<allowance> {
  // Check if allowance with same name already exists
  const existingAllowance = await this.allowanceModel.findOne({ 
    name: createDto.name 
  }).exec();
  
  if (existingAllowance) {
    throw new BadRequestException(`Allowance '${createDto.name}' already exists`);
  }

  const newAllowance = new this.allowanceModel({
    ...createDto,
    status: ConfigStatus.DRAFT,
  });
  
  return await newAllowance.save();
}

async findAllAllowances(queryDto: QueryAllowanceDto): Promise<{
  data: allowance[];
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
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.allowanceModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
    this.allowanceModel.countDocuments(query).exec(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async findOneAllowance(id: string): Promise<allowance> {
  const allowance = await this.allowanceModel.findById(id).exec();
  if (!allowance) {
    throw new NotFoundException(`Allowance with ID ${id} not found`);
  }
  return allowance;
}

async updateAllowance(id: string, updateDto: UpdateAllowanceDto): Promise<allowance> {
  const allowance = await this.findOneAllowance(id);

  if (allowance.status !== ConfigStatus.DRAFT) {
    throw new ForbiddenException(
      `Cannot update allowance with status '${allowance.status}'. Only DRAFT allowances can be edited.`
    );
  }

  const updatedAllowance = await this.allowanceModel
    .findByIdAndUpdate(id, updateDto, { new: true })
    .exec();
  return updatedAllowance as allowance;
}

async removeAllowance(id: string): Promise<{ message: string }> {
  const allowance = await this.findOneAllowance(id);

  if (allowance.status !== ConfigStatus.DRAFT) {
    throw new ForbiddenException(
      `Cannot delete allowance with status '${allowance.status}'. Only DRAFT allowances can be deleted.`
    );
  }

  await this.allowanceModel.findByIdAndDelete(id).exec();
  return { message: `Allowance '${allowance.name}' has been successfully deleted` };
}

async approveAllowance(id: string, approvedBy: string): Promise<allowance> {
  const allowance = await this.findOneAllowance(id);

  if (allowance.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException(
      `Cannot approve allowance with status '${allowance.status}'. Only DRAFT allowances can be approved.`
    );
  }

  const approvedAllowance = await this.allowanceModel
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
  return approvedAllowance as allowance;
}

async rejectAllowance(id: string, approvedBy: string): Promise<allowance> {
  const allowance = await this.findOneAllowance(id);

  if (allowance.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException(
      `Cannot reject allowance with status '${allowance.status}'. Only DRAFT allowances can be rejected.`
    );
  }

  const rejectedAllowance = await this.allowanceModel
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
  return rejectedAllowance as allowance;
}
// ========== SIGNING BONUS METHODS ==========
async createSigningBonus(createDto: CreateSigningBonusDto): Promise<signingBonus> {
  // Check if signing bonus with same position already exists
  const existingSigningBonus = await this.signingBonusModel.findOne({ 
    positionName: createDto.positionName 
  }).exec();
  
  if (existingSigningBonus) {
    throw new BadRequestException(`Signing bonus for position '${createDto.positionName}' already exists`);
  }

  const newSigningBonus = new this.signingBonusModel({
    ...createDto,
    status: ConfigStatus.DRAFT,
  });
  
  return await newSigningBonus.save();
}

async findAllSigningBonuses(queryDto: QuerySigningBonusDto): Promise<{
  data: signingBonus[];
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
      { positionName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.signingBonusModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
    this.signingBonusModel.countDocuments(query).exec(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async findOneSigningBonus(id: string): Promise<signingBonus> {
  const signingBonus = await this.signingBonusModel.findById(id).exec();
  if (!signingBonus) {
    throw new NotFoundException(`Signing bonus with ID ${id} not found`);
  }
  return signingBonus;
}

async updateSigningBonus(id: string, updateDto: UpdateSigningBonusDto): Promise<signingBonus> {
  const signingBonus = await this.findOneSigningBonus(id);

  if (signingBonus.status !== ConfigStatus.DRAFT) {
    throw new ForbiddenException(
      `Cannot update signing bonus with status '${signingBonus.status}'. Only DRAFT signing bonuses can be edited.`
    );
  }

  if (updateDto.positionName && updateDto.positionName !== signingBonus.positionName) {
    const existing = await this.signingBonusModel.findOne({ 
      positionName: updateDto.positionName 
    }).exec();
    if (existing) {
      throw new BadRequestException(`Signing bonus for position '${updateDto.positionName}' already exists`);
    }
  }

  const updatedSigningBonus = await this.signingBonusModel
    .findByIdAndUpdate(id, updateDto, { new: true })
    .exec();
  return updatedSigningBonus as signingBonus;
}

async removeSigningBonus(id: string): Promise<{ message: string }> {
  const signingBonus = await this.findOneSigningBonus(id);

  if (signingBonus.status !== ConfigStatus.DRAFT) {
    throw new ForbiddenException(
      `Cannot delete signing bonus with status '${signingBonus.status}'. Only DRAFT signing bonuses can be deleted.`
    );
  }

  await this.signingBonusModel.findByIdAndDelete(id).exec();
  return { message: `Signing bonus for position '${signingBonus.positionName}' has been successfully deleted` };
}

async approveSigningBonus(id: string, approvedBy: string): Promise<signingBonus> {
  const signingBonus = await this.findOneSigningBonus(id);

  if (signingBonus.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException(
      `Cannot approve signing bonus with status '${signingBonus.status}'. Only DRAFT signing bonuses can be approved.`
    );
  }

  const approvedSigningBonus = await this.signingBonusModel
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
  return approvedSigningBonus as signingBonus;
}

async rejectSigningBonus(id: string, approvedBy: string): Promise<signingBonus> {
  const signingBonus = await this.findOneSigningBonus(id);

  if (signingBonus.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException(
      `Cannot reject signing bonus with status '${signingBonus.status}'. Only DRAFT signing bonuses can be rejected.`
    );
  }

  const rejectedSigningBonus = await this.signingBonusModel
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
  return rejectedSigningBonus as signingBonus;
}
}