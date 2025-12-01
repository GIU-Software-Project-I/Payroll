
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigStatus } from '../enums/payroll-configuration-enums';
import { allowance, allowanceDocument } from '../models/allowance.schema';
import { payType, payTypeDocument } from '../models/payType.schema';
import { payGrade, payGradeDocument } from '../models/payGrades.schema';
import { taxRules, taxRulesDocument } from '../models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsDocument } from '../models/insuranceBrackets.schema';
import { payrollPolicies } from '../models/payrollPolicies.schema';
import { signingBonus } from '../models/signingBonus.schema';
import { terminationAndResignationBenefits } from '../models/terminationAndResignationBenefits';
import { CompanyWideSettings } from '../models/CompanyWideSettings.schema';
import { UpdateCompanyWideSettingsDto } from '../dto/update-company-settings.dto';
import { ApproveConfigDto } from '../dto/approve-config.dto';
import { ApproveInsuranceDto } from '../dto/approve-insurance.dto';
import { ApproveTaxRuleDto } from '../dto/approve-tax-rule.dto';
import { UpdateAllowanceDto } from '../dto/update-allowance.dto';
import { UpdatePayTypeDto } from '../dto/update-paytype.dto';
import { CreatePayGradeDto } from '../dto/create-paygrade.dto';
import { UpdatePayGradeDto } from '../dto/update-paygrade.dto';
import { UpdateTaxRuleDto } from '../dto/update-taxrule.dto';
import { UpdatePayrollPolicyDto } from '../dto/update-payrollpolicy.dto';
import { UpdateSigningBonusDto } from '../dto/update-signingbonus.dto';
import { UpdateTerminationBenefitDto } from '../dto/update-terminationbenefit.dto';
import { CreateInsuranceDto } from '../dto/create-insurance.dto';
import { CreateTaxRuleDto } from '../dto/create-tax-rule.dto';
import { UpdateInsuranceDto } from '../dto/update-insurance.dto';
import { OrganizationStructureService } from '../../../employee/Services/Organization-Structure.Service';
import { OnBoardingService } from '../../../recruitment/services/OnBoarding/initial-OnBoarding.service';
import { OffBoardingService } from '../../../recruitment/services/OffBoarding/initial-OffBoarding.service';
@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(allowance.name) private allowanceModel: Model<allowanceDocument>,
    @InjectModel(payType.name) private payTypeModel: Model<payTypeDocument>,
    @InjectModel(payGrade.name) private payGradeModel: Model<payGradeDocument>,
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(insuranceBrackets.name)
    private insuranceBracketsModel: Model<insuranceBracketsDocument>,
    @InjectModel(payrollPolicies.name)
    private payrollPoliciesModel: Model<payrollPolicies>,
    @InjectModel(signingBonus.name)
    private signingBonusModel: Model<signingBonus>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationBenefitsModel: Model<terminationAndResignationBenefits>,
    @InjectModel(CompanyWideSettings.name)
    private companySettingsModel: Model<CompanyWideSettings>,
    private readonly orgStructureService: OrganizationStructureService,
    private readonly contractService: OnBoardingService,
    private readonly offboardingService: OffBoardingService,
  ) {}

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

 

  // ===== INSURANCE BRACKETS =====

  async createInsuranceBracket(dto: CreateInsuranceDto) {
    const exists = await this.insuranceBracketsModel.findOne({ name: dto.name }).exec();
    if (exists) throw new BadRequestException(`Insurance bracket '${dto.name}' already exists`);
    const bracket = new this.insuranceBracketsModel({ ...dto, status: ConfigStatus.DRAFT });
    return await bracket.save();
  }

  async getInsuranceBrackets() {
    return await this.insuranceBracketsModel.find().sort({ createdAt: -1 }).exec();
  }

  async getInsuranceBracketById(id: string) {
    const bracket = await this.insuranceBracketsModel.findById(id).exec();
    if (!bracket) throw new NotFoundException(`Insurance bracket with ID ${id} not found`);
    return bracket;
  }

  async updateInsuranceBracket(id: string, dto: UpdateInsuranceDto) {
    const bracket = await this.insuranceBracketsModel.findById(id).exec();
    if (!bracket) throw new NotFoundException('Insurance bracket not found');
    if (bracket.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT brackets can be edited');

    return await this.insuranceBracketsModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: false },
    );
  }



  async deleteInsuranceBracket(id: string) {
    const bracket = await this.insuranceBracketsModel.findById(id).exec();
    if (!bracket) throw new NotFoundException(`Insurance bracket with ID ${id} not found`);
    if (bracket.status !== ConfigStatus.DRAFT)
      throw new ForbiddenException('Only DRAFT brackets can be deleted');

    await this.insuranceBracketsModel.findByIdAndDelete(id).exec();
    return { message: `Insurance bracket '${bracket.name}' successfully deleted` };
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
  // ==================== ALLOWANCE ====================

  /**
   * Find one allowance by ID
   */
  async findOneAllowance(id: string) {
    const allowance = await this.allowanceModel.findById(id).exec();
    if (!allowance) {
      throw new NotFoundException(`Allowance with ID ${id} not found`);
    }
    return allowance;
  }

  /**
   * PHASE 4 - REQ-PY-18: Update allowance configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updateAllowance(id: string, updateDto: UpdateAllowanceDto) {
    const allowance = await this.findOneAllowance(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (allowance.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.name !== undefined) {
      allowance.name = updateDto.name;
    }
    if (updateDto.amount !== undefined) {
      allowance.amount = updateDto.amount;
    }

    return await allowance.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete allowance configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deleteAllowance(id: string) {
    const allowance = await this.findOneAllowance(id);
    await this.allowanceModel.findByIdAndDelete(id).exec();
    return {
      message: 'Allowance deleted successfully',
      deletedId: id,
    };
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approveAllowance(id: string, approveDto: ApproveConfigDto) {
    const allowance = await this.findOneAllowance(id);
    if (allowance.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    allowance.status = ConfigStatus.APPROVED;
    allowance.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    allowance.approvedAt = new Date();
    return await allowance.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  async rejectAllowance(id: string, approveDto: ApproveConfigDto) {
    const allowance = await this.findOneAllowance(id);
    if (allowance.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    allowance.status = ConfigStatus.REJECTED;
    allowance.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    allowance.approvedAt = new Date();
    return await allowance.save();
  }

  // ==================== PAY TYPE ====================

  /**
   * Find one pay type by ID
   */
  async findOnePayType(id: string) {
    const payType = await this.payTypeModel.findById(id).exec();
    if (!payType) {
      throw new NotFoundException(`Pay type with ID ${id} not found`);
    }
    return payType;
  }

  /**
   * PHASE 4 - REQ-PY-18: Update pay type configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updatePayType(id: string, updateDto: UpdatePayTypeDto) {
    const payType = await this.findOnePayType(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (payType.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.type !== undefined) {
      payType.type = updateDto.type;
    }
    if (updateDto.amount !== undefined) {
      payType.amount = updateDto.amount;
    }

    return await payType.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete pay type configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deletePayType(id: string) {
    const payType = await this.findOnePayType(id);
    await this.payTypeModel.findByIdAndDelete(id).exec();
    return {
      message: 'Pay type deleted successfully',
      deletedId: id,
    };
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approvePayType(id: string, approveDto: ApproveConfigDto) {
    const payType = await this.findOnePayType(id);
    if (payType.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    payType.status = ConfigStatus.APPROVED;
    payType.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payType.approvedAt = new Date();
    return await payType.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Reject configuration changes
   */
  async rejectPayType(id: string, approveDto: ApproveConfigDto) {
    const payType = await this.findOnePayType(id);
    if (payType.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    payType.status = ConfigStatus.REJECTED;
    payType.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payType.approvedAt = new Date();
    return await payType.save();
  }

  // ==================== PAY GRADE ====================

  /**
   * Find one pay grade by ID
   */
  async findOnePayGrade(id: string) {
    const payGrade = await this.payGradeModel.findById(id).exec();
    if (!payGrade) {
      throw new NotFoundException(`Pay grade with ID ${id} not found`);
    }
    return payGrade;
  }

  /**
   * PHASE 2 - REQ-PY-2: Create pay grade (create draft)
   * As a Payroll Specialist, I want to define pay grades, salary ranges, and compensation limits
   * All configuration items must be created with status = Draft
   * Business Rules:
   * - BR10: The system allows multiple pay scales by grade, department, or location
   * - BR31: Gross Salary = Base Pay + Allowances
   * @param createDto - Pay grade creation data
   * @returns Created pay grade with DRAFT status
   */
  async createPayGrade(createDto: CreatePayGradeDto) {
    // Validate that grossSalary >= baseSalary (since gross = base + allowances)
    if (createDto.grossSalary < createDto.baseSalary) {
      throw new BadRequestException(
        'Gross salary must be greater than or equal to base salary (Gross = Base + Allowances)',
      );
    }

    // Check if pay grade with same name already exists
    const existingPayGrade = await this.payGradeModel
      .findOne({ grade: createDto.grade })
      .exec();

    if (existingPayGrade) {
      throw new BadRequestException(
        `Pay grade with name "${createDto.grade}" already exists`,
      );
    }

    // Create pay grade with DRAFT status (Phase 2 requirement)
    const payGrade = new this.payGradeModel({
      grade: createDto.grade,
      baseSalary: createDto.baseSalary,
      grossSalary: createDto.grossSalary,
      createdBy: new Types.ObjectId(createDto.createdByEmployeeId),
      status: ConfigStatus.DRAFT, // Phase 2: All items must be created with status = Draft
    });

    return await payGrade.save();
  }

  /**
   * PHASE 2 - REQ-PY-2: View all pay grades
   * As a Payroll Specialist, I want to view all pay grades
   * @param status - Optional filter by status (draft, approved, rejected)
   * @returns Array of all pay grades
   */
  async findAllPayGrades(status?: ConfigStatus) {
    const query = status ? { status } : {};
    return await this.payGradeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Create pay grades from organizational structure job grades/bands
   * Requirement: REQ-PY-2 - Inputs Needed: Organizational Structure → Job Grades/Bands
   * @param createdByEmployeeId - Employee ID creating the pay grades
   * @param jobGradeIds - Optional array of job grade IDs to create pay grades for. If not provided, creates for all active job grades.
   * @returns Array of created pay grades
   */
  async createPayGradesFromJobGrades(
    createdByEmployeeId: string,
    jobGradeIds?: string[],
  ) {
    // TODO: Implement findJobGradeById and getAllJobGrades methods in OrganizationStructureService
    // These methods need to be added to: backend/src/modules/employee/Services/Organization-Structure.Service.ts
    // 
    // Expected interface:
    // - findJobGradeById(id: string): Promise<{ name: string; baseSalary?: number; minSalary?: number; maxSalary?: number; isActive: boolean } | null>
    // - getAllJobGrades(): Promise<Array<{ name: string; baseSalary?: number; minSalary?: number; maxSalary?: number; isActive: boolean }>>
    
    // Get job grades from organizational structure
    let jobGrades;
    if (jobGradeIds && jobGradeIds.length > 0) {
      jobGrades = await Promise.all(
        jobGradeIds.map((id) =>
          (this.orgStructureService as any).findJobGradeById(id),
        ),
      );
      jobGrades = jobGrades.filter((grade) => grade !== null);
    } else {
      jobGrades = await (this.orgStructureService as any).getAllJobGrades();
      jobGrades = jobGrades.filter((grade) => grade.isActive);
    }

    if (jobGrades.length === 0) {
      throw new BadRequestException(
        'No active job grades found to create pay grades from',
      );
    }

    const createdPayGrades: any[] = [];
    const errors: Array<{ jobGrade: string; error: string }> = [];

    for (const jobGrade of jobGrades) {
      try {
        // Check if pay grade already exists for this job grade
        const existingPayGrade = await this.payGradeModel
          .findOne({ grade: jobGrade.name })
          .exec();

        if (existingPayGrade) {
          errors.push({
            jobGrade: jobGrade.name,
            error: 'Pay grade already exists for this job grade',
          });
          continue;
        }

        // Create pay grade from job grade
        // Use baseSalary from job grade if available, otherwise use minSalary
        const baseSalary =
          jobGrade.baseSalary || jobGrade.minSalary || 6000;
        // Calculate gross salary (base + estimated allowances, or use maxSalary if available)
        const grossSalary =
          jobGrade.maxSalary || baseSalary * 1.2; // 20% allowance estimate

        const payGrade = new this.payGradeModel({
          grade: jobGrade.name,
          baseSalary,
          grossSalary,
          createdBy: new Types.ObjectId(createdByEmployeeId),
          status: ConfigStatus.DRAFT,
        });

        const saved = await payGrade.save();
        createdPayGrades.push(saved);
      } catch (error) {
        errors.push({
          jobGrade: jobGrade.name,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }

    return {
      created: createdPayGrades,
      totalCreated: createdPayGrades.length,
      errors,
      message: `Created ${createdPayGrades.length} pay grade(s) from job grades`,
    };
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approvePayGrade(id: string, approveDto: ApproveConfigDto) {
    const payGrade = await this.findOnePayGrade(id);
    if (payGrade.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    payGrade.status = ConfigStatus.APPROVED;
    payGrade.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payGrade.approvedAt = new Date();
    return await payGrade.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Reject configuration changes
   */
  async rejectPayGrade(id: string, approveDto: ApproveConfigDto) {
    const payGrade = await this.findOnePayGrade(id);
    if (payGrade.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    payGrade.status = ConfigStatus.REJECTED;
    payGrade.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payGrade.approvedAt = new Date();
    return await payGrade.save();
  }

  /**
   * PHASE 2 - REQ-PY-2: Update pay grade configuration (edit draft)
   * PHASE 4 - REQ-PY-18: Also allows editing REJECTED configurations
   * Phase 2 Requirement: Editing is allowed ONLY while status is Draft
   * Phase 4 Requirement: Cannot edit approved configurations - must delete and create new one
   */
  async updatePayGrade(id: string, updateDto: UpdatePayGradeDto) {
    const payGrade = await this.findOnePayGrade(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (payGrade.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // PHASE 2 Requirement: Editing is allowed ONLY while status is Draft
    // Phase 4 also allows REJECTED to be edited
    if (payGrade.status !== ConfigStatus.DRAFT && payGrade.status !== ConfigStatus.REJECTED) {
      throw new BadRequestException(
        'Only DRAFT or REJECTED configurations can be edited',
      );
    }

    // Validate grossSalary >= baseSalary if both are being updated
    const newBaseSalary = updateDto.baseSalary !== undefined ? updateDto.baseSalary : payGrade.baseSalary;
    const newGrossSalary = updateDto.grossSalary !== undefined ? updateDto.grossSalary : payGrade.grossSalary;
    
    if (newGrossSalary < newBaseSalary) {
      throw new BadRequestException(
        'Gross salary must be greater than or equal to base salary (Gross = Base + Allowances)',
      );
    }

    // Update fields
    if (updateDto.grade !== undefined) {
      // Check if new grade name already exists (excluding current pay grade)
      const existingPayGrade = await this.payGradeModel
        .findOne({ grade: updateDto.grade, _id: { $ne: id } })
        .exec();

      if (existingPayGrade) {
        throw new BadRequestException(
          `Pay grade with name "${updateDto.grade}" already exists`,
        );
      }
      payGrade.grade = updateDto.grade;
    }
    if (updateDto.baseSalary !== undefined) {
      payGrade.baseSalary = updateDto.baseSalary;
    }
    if (updateDto.grossSalary !== undefined) {
      payGrade.grossSalary = updateDto.grossSalary;
    }

    return await payGrade.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete pay grade configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deletePayGrade(id: string) {
    const payGrade = await this.findOnePayGrade(id);
    await this.payGradeModel.findByIdAndDelete(id).exec();
    return {
      message: 'Pay grade deleted successfully',
      deletedId: id,
    };
  }

  // ==================== TAX RULES ====================

  /**
   * Find one tax rule by ID
   */
  async findOneTaxRule(id: string) {
    const taxRule = await this.taxRulesModel.findById(id).exec();
    if (!taxRule) {
      throw new NotFoundException(`Tax rule with ID ${id} not found`);
    }
    return taxRule;
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approveTaxRule(id: string, approveDto: ApproveConfigDto) {
    const taxRule = await this.findOneTaxRule(id);
    if (taxRule.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    taxRule.status = ConfigStatus.APPROVED;
    taxRule.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    taxRule.approvedAt = new Date();
    return await taxRule.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Reject configuration changes
   */
  async rejectTaxRule(id: string, approveDto: ApproveConfigDto) {
    const taxRule = await this.findOneTaxRule(id);
    if (taxRule.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    taxRule.status = ConfigStatus.REJECTED;
    taxRule.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    taxRule.approvedAt = new Date();
    return await taxRule.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Update tax rule configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updateTaxRule(id: string, updateDto: UpdateTaxRuleDto) {
    const taxRule = await this.findOneTaxRule(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (taxRule.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.name !== undefined) {
      taxRule.name = updateDto.name;
    }
    if (updateDto.description !== undefined) {
      taxRule.description = updateDto.description;
    }
    if (updateDto.rate !== undefined) {
      taxRule.rate = updateDto.rate;
    }

    return await taxRule.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete tax rule configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deleteTaxRule(id: string) {
    const taxRule = await this.findOneTaxRule(id);
    await this.taxRulesModel.findByIdAndDelete(id).exec();
    return {
      message: 'Tax rule deleted successfully',
      deletedId: id,
    };
  }

  // ==================== INSURANCE BRACKETS ====================

  /**
   * Find one insurance bracket by ID
   */
  async findOneInsuranceBracket(id: string) {
    const insuranceBracket = await this.insuranceBracketsModel.findById(id).exec();
    if (!insuranceBracket) {
      throw new NotFoundException(`Insurance bracket with ID ${id} not found`);
    }
    return insuranceBracket;
  }

  // HR Manager approval for insurance brackets (Phase 5)
  /**
   * PHASE 5 - REQ-PY-22: HR Approval of Insurance Brackets
   * HR Manager review, approve insurance brackets (special case - not Payroll Manager)
   */
  async approveInsuranceBracket(id: string, approveDto: ApproveConfigDto) {
    const insuranceBracket = await this.findOneInsuranceBracket(id);
    if (insuranceBracket.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    insuranceBracket.status = ConfigStatus.APPROVED;
    insuranceBracket.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    insuranceBracket.approvedAt = new Date();
    return await insuranceBracket.save();
  }

  /**
   * PHASE 5 - REQ-PY-22: HR Approval of Insurance Brackets
   * HR Manager reject insurance brackets
   */
  async rejectInsuranceBracket(id: string, approveDto: ApproveConfigDto) {
    const insuranceBracket = await this.findOneInsuranceBracket(id);
    if (insuranceBracket.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    insuranceBracket.status = ConfigStatus.REJECTED;
    insuranceBracket.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    insuranceBracket.approvedAt = new Date();
    return await insuranceBracket.save();
  }

  // ==================== PAYROLL POLICIES ====================

  /**
   * Find one payroll policy by ID
   */
  async findOnePayrollPolicy(id: string) {
    const policy = await this.payrollPoliciesModel.findById(id).exec();
    if (!policy) {
      throw new NotFoundException(`Payroll policy with ID ${id} not found`);
    }
    return policy;
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approvePayrollPolicy(id: string, approveDto: ApproveConfigDto) {
    const policy = await this.findOnePayrollPolicy(id);
    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    policy.status = ConfigStatus.APPROVED;
    policy.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    policy.approvedAt = new Date();
    return await policy.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Reject configuration changes
   */
  async rejectPayrollPolicy(id: string, approveDto: ApproveConfigDto) {
    const policy = await this.findOnePayrollPolicy(id);
    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    policy.status = ConfigStatus.REJECTED;
    policy.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    policy.approvedAt = new Date();
    return await policy.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Update payroll policy configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updatePayrollPolicy(id: string, updateDto: UpdatePayrollPolicyDto) {
    const policy = await this.findOnePayrollPolicy(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (policy.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.policyName !== undefined) {
      policy.policyName = updateDto.policyName;
    }
    if (updateDto.policyType !== undefined) {
      policy.policyType = updateDto.policyType;
    }
    if (updateDto.description !== undefined) {
      policy.description = updateDto.description;
    }
    if (updateDto.effectiveDate !== undefined) {
      policy.effectiveDate = updateDto.effectiveDate;
    }
    if (updateDto.ruleDefinition !== undefined) {
      policy.ruleDefinition = updateDto.ruleDefinition;
    }
    if (updateDto.applicability !== undefined) {
      policy.applicability = updateDto.applicability;
    }

    return await policy.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete payroll policy configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deletePayrollPolicy(id: string) {
    const policy = await this.findOnePayrollPolicy(id);
    await this.payrollPoliciesModel.findByIdAndDelete(id).exec();
    return {
      message: 'Payroll policy deleted successfully',
      deletedId: id,
    };
  }

  // ==================== SIGNING BONUS ====================

  /**
   * Find one signing bonus by ID
   */
  async findOneSigningBonus(id: string) {
    const signingBonus = await this.signingBonusModel.findById(id).exec();
    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID ${id} not found`);
    }
    return signingBonus;
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approveSigningBonus(id: string, approveDto: ApproveConfigDto) {
    const signingBonus = await this.findOneSigningBonus(id);
    if (signingBonus.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    signingBonus.status = ConfigStatus.APPROVED;
    signingBonus.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    signingBonus.approvedAt = new Date();
    return await signingBonus.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Reject configuration changes
   */
  async rejectSigningBonus(id: string, approveDto: ApproveConfigDto) {
    const signingBonus = await this.findOneSigningBonus(id);
    if (signingBonus.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    signingBonus.status = ConfigStatus.REJECTED;
    signingBonus.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    signingBonus.approvedAt = new Date();
    return await signingBonus.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Update signing bonus configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updateSigningBonus(id: string, updateDto: UpdateSigningBonusDto) {
    const signingBonus = await this.findOneSigningBonus(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (signingBonus.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.positionName !== undefined) {
      signingBonus.positionName = updateDto.positionName;
    }
    if (updateDto.amount !== undefined) {
      signingBonus.amount = updateDto.amount;
    }

    return await signingBonus.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete signing bonus configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deleteSigningBonus(id: string) {
    const signingBonus = await this.findOneSigningBonus(id);
    await this.signingBonusModel.findByIdAndDelete(id).exec();
    return {
      message: 'Signing bonus deleted successfully',
      deletedId: id,
    };
  }

  // ==================== TERMINATION BENEFITS ====================

  /**
   * Find one termination benefit by ID
   */
  async findOneTerminationBenefit(id: string) {
    const benefit = await this.terminationBenefitsModel.findById(id).exec();
    if (!benefit) {
      throw new NotFoundException(`Termination benefit with ID ${id} not found`);
    }
    return benefit;
  }

  /**
   * PHASE 4 - REQ-PY-18: Payroll Manager Approval (Except Insurance)
   * Publishing requires Payroll Manager approval
   */
  async approveTerminationBenefit(id: string, approveDto: ApproveConfigDto) {
    const benefit = await this.findOneTerminationBenefit(id);
    if (benefit.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be approved');
    }
    benefit.status = ConfigStatus.APPROVED;
    benefit.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    benefit.approvedAt = new Date();
    return await benefit.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Reject configuration changes
   */
  async rejectTerminationBenefit(id: string, approveDto: ApproveConfigDto) {
    const benefit = await this.findOneTerminationBenefit(id);
    if (benefit.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT configurations can be rejected');
    }
    benefit.status = ConfigStatus.REJECTED;
    benefit.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    benefit.approvedAt = new Date();
    return await benefit.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Update termination benefit configuration
   * Cannot edit approved configurations - must delete and create new one
   */
  async updateTerminationBenefit(id: string, updateDto: UpdateTerminationBenefitDto) {
    const benefit = await this.findOneTerminationBenefit(id);
    
    // PHASE 4 Requirement: Even Payroll Manager cannot edit after approval
    if (benefit.status === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved configurations. Delete and create a new one.',
      );
    }

    // Only allow editing DRAFT or REJECTED configurations
    if (updateDto.name !== undefined) {
      benefit.name = updateDto.name;
    }
    if (updateDto.amount !== undefined) {
      benefit.amount = updateDto.amount;
    }
    if (updateDto.terms !== undefined) {
      benefit.terms = updateDto.terms;
    }

    return await benefit.save();
  }

  /**
   * PHASE 4 - REQ-PY-18: Delete termination benefit configuration
   * Delete is allowed for approved configurations (except Insurance)
   */
  async deleteTerminationBenefit(id: string) {
    const benefit = await this.findOneTerminationBenefit(id);
    await this.terminationBenefitsModel.findByIdAndDelete(id).exec();
    return {
      message: 'Termination benefit deleted successfully',
      deletedId: id,
    };
  }

  // ==================== COMPANY WIDE SETTINGS ====================
  /**
   * PHASE 3 - REQ-PY-15: Company-Wide Payroll Settings
   * Get company-wide settings (pay dates, time zone, currency)
   */
  async getCompanyWideSettings() {
    let settings = await this.companySettingsModel.findOne().exec();
    if (!settings) {
      // Create default settings if none exist
      settings = new this.companySettingsModel({
        payDate: new Date(),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      });
      await settings.save();
    }
    return settings;
  }

  /**
   * PHASE 3 - REQ-PY-15: Company-Wide Payroll Settings
   * Update company-wide settings (pay dates, time zone, currency)
   */
  async updateCompanyWideSettings(updateDto: UpdateCompanyWideSettingsDto) {
    let settings = await this.companySettingsModel.findOne().exec();
    if (!settings) {
      settings = new this.companySettingsModel({
        ...updateDto,
        currency: updateDto.currency || 'EGP',
      });
    } else {
      Object.assign(settings, updateDto);
    }
    return await settings.save();
  }

  // ==================== BACKUP FUNCTIONALITY (REQ-PY-16) ====================
  /**
   * Create backup of payroll configuration & tables
   * Requirement: REQ-PY-16 - System Backup Configuration
   * This is a simplified backup service that backs up only payroll configuration collections
   */
  async createBackup(options: {
    name?: string;
    oplog?: boolean;
    dumpDbUsersAndRoles?: boolean;
  } = {}): Promise<any> {
    // Import backup service dynamically to avoid circular dependencies
    // In production, this should use a proper backup service
    const { BackupService } = await import('../backup/Backup-Service.js');
    const backupService = new BackupService(null as any); // Audit service is optional

    try {
      return await backupService.createBackup({
        name: options.name || 'payroll-config-backup',
        oplog: options.oplog ?? false,
        dumpDbUsersAndRoles: options.dumpDbUsersAndRoles ?? false,
      });
    } catch (error) {
      // If backup service fails, log and throw
      throw new BadRequestException(
        `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * PHASE 3 - REQ-PY-16: System Backup Configuration
   * List all backups
   */
  async listBackups(): Promise<any[]> {
    const { BackupService } = await import('../backup/Backup-Service.js');
    const backupService = new BackupService(null as any);

    try {
      return await backupService.listBackups();
    } catch (error) {
      throw new BadRequestException(
        `Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * PHASE 3 - REQ-PY-16: System Backup Configuration
   * Delete a backup
   */
  async deleteBackup(filename: string): Promise<void> {
    const { BackupService } = await import('../backup/Backup-Service.js');
    const backupService = new BackupService(null as any);

    try {
      return await backupService.deleteBackup(filename);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }


}
