import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { taxRules, taxRulesDocument } from '../models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsDocument } from '../models/insuranceBrackets.schema';
import { ConfigStatus } from '../enums/payroll-configuration-enums';
import { ApproveInsuranceDto } from '../dto/approve-insurance.dto';
import { ApproveTaxRuleDto } from '../dto/approve-tax-rule.dto';
import { CreateInsuranceDto } from '../dto/create-insurance.dto';
import { CreateTaxRuleDto } from '../dto/create-tax-rule.dto';
import { UpdateInsuranceDto } from '../dto/update-insurance.dto';
import { UpdateTaxRuleDto } from '../dto/update-tax-rule.dto';

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(insuranceBrackets.name) private insuranceModel: Model<insuranceBracketsDocument>,
  ) {}

  // ===== TAX RULES =====

  async createTaxRule(dto: CreateTaxRuleDto) {
    const exists = await this.taxRulesModel.findOne({ name: dto.name }).exec();
    if (exists) throw new BadRequestException(`Tax rule '${dto.name}' already exists`);
    const taxRule = new this.taxRulesModel({ ...dto, status: ConfigStatus.DRAFT });
    return await taxRule.save();
  }

  async getTaxRules() {
    return await this.taxRulesModel.find().sort({ createdAt: -1 }).exec();
  }

  async getTaxRuleById(id: string) {
    const taxRule = await this.taxRulesModel.findById(id).exec();
    if (!taxRule) throw new NotFoundException(`Tax rule with ID ${id} not found`);
    return taxRule;
  }

async approveTaxRule(id: string, dto: ApproveTaxRuleDto) {
  const taxRule = await this.taxRulesModel.findById(id).exec();

  if (!taxRule) {
    throw new NotFoundException('Tax rule not found');
  }

  if (taxRule.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException('Only DRAFT tax rules can be approved');
  }

  if (!dto.approvedBy || dto.approvedBy.trim() === '') {
    throw new BadRequestException('approvedBy is required');
  }

  // NEW VALIDATION: must be valid ObjectId
  if (!Types.ObjectId.isValid(dto.approvedBy)) {
    throw new BadRequestException('approvedBy must be a valid MongoDB ObjectId');
  }

  taxRule.approvedBy = new Types.ObjectId(dto.approvedBy);
  taxRule.status = ConfigStatus.APPROVED;
  taxRule.approvedAt = new Date();

  return await taxRule.save();
}


  async updateLegalRule(id: string, dto: UpdateTaxRuleDto) {
    const rule = await this.taxRulesModel.findById(id).exec();
    if (!rule) throw new NotFoundException('Legal rule not found');
    if (rule.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT rules can be edited');

    return await this.taxRulesModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: false },
    );
  }

  async deleteTaxRule(id: string) {
    const rule = await this.taxRulesModel.findById(id).exec();
    if (!rule) throw new NotFoundException(`Tax rule with ID ${id} not found`);
    if (rule.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT rules can be deleted');

    await this.taxRulesModel.findByIdAndDelete(id).exec();
    return { message: `Tax rule '${rule.name}' successfully deleted` };
  }

  // ===== INSURANCE BRACKETS =====

  async createInsuranceBracket(dto: CreateInsuranceDto) {
    const exists = await this.insuranceModel.findOne({ name: dto.name }).exec();
    if (exists) throw new BadRequestException(`Insurance bracket '${dto.name}' already exists`);
    const bracket = new this.insuranceModel({ ...dto, status: ConfigStatus.DRAFT });
    return await bracket.save();
  }

  async getInsuranceBrackets() {
    return await this.insuranceModel.find().sort({ createdAt: -1 }).exec();
  }

  async getInsuranceBracketById(id: string) {
    const bracket = await this.insuranceModel.findById(id).exec();
    if (!bracket) throw new NotFoundException(`Insurance bracket with ID ${id} not found`);
    return bracket;
  }

  async updateInsuranceBracket(id: string, dto: UpdateInsuranceDto) {
    const bracket = await this.insuranceModel.findById(id).exec();
    if (!bracket) throw new NotFoundException('Insurance bracket not found');
    if (bracket.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT brackets can be edited');

    return await this.insuranceModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: false },
    );
  }

 async approveInsuranceBracket(id: string, dto: ApproveInsuranceDto) {
  const bracket = await this.insuranceModel.findById(id).exec();

  if (!bracket) {
    throw new NotFoundException('Insurance bracket not found');
  }

  if (bracket.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException('Only DRAFT brackets can be approved');
  }

  if (!dto.approvedBy || dto.approvedBy.trim() === '') {
    throw new BadRequestException('approvedBy is required');
  }

  // NEW VALIDATION
  if (!Types.ObjectId.isValid(dto.approvedBy)) {
    throw new BadRequestException('approvedBy must be a valid MongoDB ObjectId');
  }

  bracket.approvedBy = new Types.ObjectId(dto.approvedBy);
  bracket.status = ConfigStatus.APPROVED;
  bracket.approvedAt = new Date();

  return await bracket.save();
}


  async deleteInsuranceBracket(id: string) {
    const bracket = await this.insuranceModel.findById(id).exec();
    if (!bracket) throw new NotFoundException(`Insurance bracket with ID ${id} not found`);
    if (bracket.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT brackets can be deleted');

    await this.insuranceModel.findByIdAndDelete(id).exec();
    return { message: `Insurance bracket '${bracket.name}' successfully deleted` };
  }

  async rejectTaxRule(id: string, dto: ApproveTaxRuleDto) {
  const taxRule = await this.taxRulesModel.findById(id).exec();

  if (!taxRule) {
    throw new NotFoundException('Tax rule not found');
  }

  if (taxRule.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException('Only DRAFT tax rules can be rejected');
  }

  if (!dto.approvedBy || dto.approvedBy.trim() === '') {
    throw new BadRequestException('approvedBy is required');
  }

  if (!Types.ObjectId.isValid(dto.approvedBy)) {
    throw new BadRequestException('approvedBy must be a valid MongoDB ObjectId');
  }

  taxRule.approvedBy = new Types.ObjectId(dto.approvedBy);
  taxRule.status = ConfigStatus.REJECTED;
  taxRule.approvedAt = new Date();

  return await taxRule.save();
}


async rejectInsuranceBracket(id: string, dto: ApproveInsuranceDto) {
  const bracket = await this.insuranceModel.findById(id).exec();

  if (!bracket) {
    throw new NotFoundException('Insurance bracket not found');
  }

  if (bracket.status !== ConfigStatus.DRAFT) {
    throw new BadRequestException('Only DRAFT brackets can be rejected');
  }

  if (!dto.approvedBy || dto.approvedBy.trim() === '') {
    throw new BadRequestException('approvedBy is required');
  }

  if (!Types.ObjectId.isValid(dto.approvedBy)) {
    throw new BadRequestException('approvedBy must be a valid MongoDB ObjectId');
  }

  bracket.approvedBy = new Types.ObjectId(dto.approvedBy);
  bracket.status = ConfigStatus.REJECTED;
  bracket.approvedAt = new Date();

  return await bracket.save();
}

  // ===== HELPER METHOD FOR CONTRIBUTION CALCULATION =====

  /**
   * Calculate employee and employer contributions based on salary and bracket rates.
   * Returns null if salary does not fall into bracket range.
   */
  calculateContributions(bracket: insuranceBrackets, salary: number) {
    if (salary < bracket.minSalary || salary > bracket.maxSalary) return null;
    const employeeContribution = (salary * bracket.employeeRate) / 100;
    const employerContribution = (salary * bracket.employerRate) / 100;
    return { employeeContribution, employerContribution };
  }
}
//making sure