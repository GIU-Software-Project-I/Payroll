//payroll-execution/services/payroll-execution.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { payrollRuns } from '../models/payrollRuns.schema';
import { paySlip } from '../models/payslip.schema';
import { employeePayrollDetails } from '../models/employeePayrollDetails.schema';
import { employeeSigningBonus } from '../models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from '../models/EmployeeTerminationResignation.schema';
import { employeePenalties } from '../models/employeePenalties.schema';

import {
  BenefitStatus,
  BonusStatus,
  PayRollPaymentStatus,
  PayRollStatus,
  PaySlipPaymentStatus,
} from '../enums/payroll-execution-enum';

interface CreateRunInput {
  runId: string;
  payrollPeriod: string | Date;
  entity: string;
  payrollSpecialistId: string;
  payrollManagerId: string;
}

interface DraftEmployeeInput {
  employeeId: string;
  baseSalary: number;
  allowances?: number;
  bonuses?: number;
  benefits?: number;
  refunds?: number;
  taxAmount?: number;
  insuranceAmount?: number;
  unpaidLeaveAmount?: number;
  overtimeAmount?: number;
  notes?: string;
  exceptions?: string;
}

@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(payrollRuns.name)
    private readonly payrollRunModel: Model<any>,

    @InjectModel(paySlip.name)
    private readonly payslipModel: Model<any>,

    @InjectModel(employeePayrollDetails.name)
    private readonly employeePayrollDetailsModel: Model<any>,

    @InjectModel(employeeSigningBonus.name)
    private readonly employeeSigningBonusModel: Model<any>,

    @InjectModel(EmployeeTerminationResignation.name)
    private readonly employeeTerminationResignationModel: Model<any>,

    @InjectModel(employeePenalties.name)
    private readonly employeePenaltiesModel: Model<any>,
  ) {}

  // ---------------------------------------------------------------------------
  // Phase 0: Signing Bonus review (REQ-PY-28, REQ-PY-29)
  // ---------------------------------------------------------------------------

  async getPendingSigningBonuses() {
    return this.employeeSigningBonusModel
      .find({ status: BonusStatus.PENDING })
      .populate('employeeId')
      .populate('signingBonusId')
      .exec();
  }

  async approveSigningBonus(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.updateSigningBonusStatus(id, BonusStatus.APPROVED);
  }

  async rejectSigningBonus(id: string) {
    return this.updateSigningBonusStatus(id, BonusStatus.REJECTED);
  }

  async editSigningBonus(
    id: string,
    payload: {
      paymentDate?: string | Date;
      status?: BonusStatus;
      signingBonusId?: string;
    },
  ) {
    const update: any = {};

    if (payload.paymentDate) {
      update.paymentDate =
        payload.paymentDate instanceof Date
          ? payload.paymentDate
          : new Date(payload.paymentDate);
    }

    if (payload.status) {
      update.status = payload.status;
    }

    if (payload.signingBonusId) {
      update.signingBonusId = new Types.ObjectId(payload.signingBonusId);
    }

    const updated = await this.employeeSigningBonusModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Signing bonus record not found');
    }

    return updated;
  }

  private async updateSigningBonusStatus(id: string, status: BonusStatus) {
    const updated = await this.employeeSigningBonusModel
      .findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
        },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Signing bonus record not found');
    }
    return updated;
  }

  // ---------------------------------------------------------------------------
  // Phase 0: Termination / Resignation benefits review (REQ-PY-31, REQ-PY-32)
  // ---------------------------------------------------------------------------

  async getPendingTerminationBenefits() {
    return this.employeeTerminationResignationModel
      .find({ status: BenefitStatus.PENDING })
      .populate('employeeId')
      .populate('benefitId')
      .populate('terminationId')
      .exec();
  }

  async approveTerminationBenefit(id: string) {
    return this.updateTerminationBenefitStatus(id, BenefitStatus.APPROVED);
  }

  async rejectTerminationBenefit(id: string) {
    return this.updateTerminationBenefitStatus(id, BenefitStatus.REJECTED);
  }

  async editTerminationBenefit(
    id: string,
    payload: {
      paymentDate?: string | Date;
      status?: BenefitStatus;
      benefitId?: string;
    },
  ) {
    const update: any = {};

    if (payload.paymentDate) {
      update.paymentDate =
        payload.paymentDate instanceof Date
          ? payload.paymentDate
          : new Date(payload.paymentDate);
    }

    if (payload.status) {
      update.status = payload.status;
    }

    if (payload.benefitId) {
      update.benefitId = new Types.ObjectId(payload.benefitId);
    }

    const updated = await this.employeeTerminationResignationModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(
        'Employee termination/resignation benefit record not found',
      );
    }

    return updated;
  }

  private async updateTerminationBenefitStatus(
    id: string,
    status: BenefitStatus,
  ) {
    const updated = await this.employeeTerminationResignationModel
      .findByIdAndUpdate(
        id,
        { status },
        {
          new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        'Employee termination/resignation benefit record not found',
      );
    }
    return updated;
  }

  // ---------------------------------------------------------------------------
  // Payroll Runs CRUD + Status transitions (Phases 1, 2, 3)
  // ---------------------------------------------------------------------------

  async createRun(input: CreateRunInput) {
    const existing = await this.payrollRunModel
      .findOne({ runId: input.runId })
      .exec();
    if (existing) {
      throw new BadRequestException('runId already exists');
    }

    const payrollPeriod =
      input.payrollPeriod instanceof Date
        ? input.payrollPeriod
        : new Date(input.payrollPeriod);

    const created = new this.payrollRunModel({
      runId: input.runId,
      payrollPeriod,
      entity: input.entity,
      status: PayRollStatus.DRAFT,
      employees: 0,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: new Types.ObjectId(input.payrollSpecialistId),
      payrollManagerId: new Types.ObjectId(input.payrollManagerId),
      paymentStatus: PayRollPaymentStatus.PENDING,
    });

    return created.save();
  }

  async getAllRuns() {
    return this.payrollRunModel
      .find()
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .populate('financeStaffId')
      .exec();
  }

  async getRunByRunId(runId: string) {
    const run = await this.payrollRunModel
      .findOne({ runId })
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .populate('financeStaffId')
      .exec();
    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async submitRunForReview(runId: string) {
    return this.updateRunStatus(runId, PayRollStatus.UNDER_REVIEW);
  }

  async managerApproveRun(runId: string, managerId: string) {
    const run = await this.payrollRunModel
      .findOneAndUpdate(
        { runId },
        {
          status: PayRollStatus.PENDING_FINANCE_APPROVAL,
          payrollManagerId: new Types.ObjectId(managerId),
          managerApprovalDate: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async financeApproveRun(runId: string, financeStaffId: string) {
    const run = await this.payrollRunModel
      .findOneAndUpdate(
        { runId },
        {
          status: PayRollStatus.APPROVED,
          financeStaffId: new Types.ObjectId(financeStaffId),
          financeApprovalDate: new Date(),
          paymentStatus: PayRollPaymentStatus.PAID,
        },
        { new: true },
      )
      .exec();

    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async rejectRun(runId: string, reason: string) {
    const run = await this.payrollRunModel
      .findOneAndUpdate(
        { runId },
        {
          status: PayRollStatus.REJECTED,
          rejectionReason: reason },
        { new: true },
      )
      .exec();

    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async lockRun(runId: string) {
    return this.updateRunStatus(runId, PayRollStatus.LOCKED);
  }

  async unlockRun(runId: string, reason: string) {
    const run = await this.payrollRunModel
      .findOneAndUpdate(
        { runId },
        {
          status: PayRollStatus.UNLOCKED,
          unlockReason: reason },
        { new: true },
      )
      .exec();

    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  private async updateRunStatus(runId: string, status: PayRollStatus) {
    const run = await this.payrollRunModel
      .findOneAndUpdate({ runId }, { status }, { new: true })
      .exec();

    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  // ---------------------------------------------------------------------------
  // Draft generation helpers (Phase 1.1)
  // ---------------------------------------------------------------------------

  private calculateNetPayFromDraft(
    emp: DraftEmployeeInput,
    penaltiesAmount = 0,
  ) {
    const baseSalary = emp.baseSalary ?? 0;
    const allowances = emp.allowances ?? 0;
    const bonuses = emp.bonuses ?? 0;
    const benefits = emp.benefits ?? 0;
    const refunds = emp.refunds ?? 0;
    const overtimeAmount = emp.overtimeAmount ?? 0;

    const tax = emp.taxAmount ?? 0;
    const insurance = emp.insuranceAmount ?? 0;
    const unpaidLeaveAmount = emp.unpaidLeaveAmount ?? 0;

    const gross =
      baseSalary + allowances + bonuses + benefits + refunds + overtimeAmount;
    const deductions = tax + insurance + unpaidLeaveAmount + penaltiesAmount;

    return gross - deductions;
  }

  private buildPenaltiesMap(penaltyDocs: any[]): Map<string, number> {
    const map = new Map<string, number>();

    for (const doc of penaltyDocs) {
      const d: any = doc;
      if (!d.employeeId) continue;

      const key = d.employeeId.toString();
      const total = Array.isArray(d.penalties)
        ? d.penalties.reduce(
          (sum: number, p: any) => sum + (p?.amount ?? 0),
          0,
        )
        : 0;

      map.set(key, (map.get(key) ?? 0) + total);
    }

    return map;
  }

  // =========================
  // 1.1 Payroll Draft Generation (REQ-PY-1)
  // =========================
  /**
   * Generate draft employeePayrollDetails for a given payroll run.
   *
   * Business rules covered:
   *  - BR2: base salary from contract (baseSalary in input)
   *  - BR31: Net Salary formula (Gross - Deductions)
   *  - BR36: store all elements used in calculation
   *  - BR46: assumes employees are enrolled in allowances/taxes/insurance (values passed from FE)
   *  - BR63: validation before processing
   *  - BR66: skip / flag employees with inactive contracts
   *  - BR64: flag missing bank details
   */
  async generateDraftForRun(
    runId: string,
    employees: {
      employeeId: string;
      baseSalary: number;

      // earnings side
      allowances?: number;
      signingBonus?: number; // from Onboarding
      resignationBenefit?: number; // from Offboarding
      refunds?: number; // from Payroll Tracking (refunds / claims)

      // deductions side
      taxAmount: number;
      insuranceAmount: number;
      unpaidLeaveAmount?: number;
      penaltiesAmount?: number;

      // validations
      hasActiveContract: boolean;
      hasValidBankAccount: boolean;
    }[],
  ) {
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      throw new BadRequestException(
        'employees array is required and cannot be empty',
      );
    }

    // نجيب الـ run
    const run: any = await this.getRunByRunId(runId);

    // BR63 + BR66: منفعش نشتغل على run مقفول أو مدفوع
    if (
      run.paymentStatus === PayRollPaymentStatus.PAID ||
      run.status === PayRollStatus.LOCKED
    ) {
      throw new BadRequestException(
        'Cannot generate draft for a locked or already paid payroll run',
      );
    }

    // نمسح أي draft قديم لنفس الـ run (لو المستخدم أعاد التوليد)
    await this.employeePayrollDetailsModel
      .deleteMany({ payrollRunId: run._id })
      .exec();

    let employeesCount = 0;
    let totalNetPay = 0;
    let exceptionsCount = 0;

    const bulkOperations: any[] = [];

    for (const e of employees) {
      if (!e.employeeId || typeof e.baseSalary !== 'number') {
        throw new BadRequestException(
          'Each employee record must include employeeId and baseSalary',
        );
      }

      // =============================
      // BR66 – contract must be active
      // =============================
      if (!e.hasActiveContract) {
        const exceptionMessage = 'CONTRACT_INACTIVE_OR_EXPIRED';

        bulkOperations.push({
          insertOne: {
            document: {
              employeeId: new Types.ObjectId(e.employeeId),
              payrollRunId: run._id,
              baseSalary: e.baseSalary,
              deductions: 0,
              netPay: 0,
              exceptions: exceptionMessage,
            },
          },
        });

        employeesCount++;
        exceptionsCount++;
        continue;
      }

      // earnings side
      const allowances = e.allowances ?? 0;
      const bonus = e.signingBonus ?? 0;
      const benefit = e.resignationBenefit ?? 0;
      const refunds = e.refunds ?? 0;

      // deductions side
      const taxAmount = e.taxAmount ?? 0;
      const insuranceAmount = e.insuranceAmount ?? 0;
      const unpaidLeaveAmount = e.unpaidLeaveAmount ?? 0;
      const penaltiesAmount = e.penaltiesAmount ?? 0;

      // =========================
      // BR31 – Net Salary formula
      // =========================
      const gross = e.baseSalary + allowances + bonus + benefit + refunds;

      let deductions =
        taxAmount + insuranceAmount + unpaidLeaveAmount + penaltiesAmount;

      let netPay = gross - deductions;

      const exceptionMessages: string[] = [];

      // BR64 – flag missing bank linkage
      if (!e.hasValidBankAccount) {
        exceptionMessages.push('MISSING_BANK_DETAILS');
      }

      // BR63 / BR60 – avoid negative net salary
      if (netPay < 0) {
        exceptionMessages.push('NEGATIVE_NET_PAY');
        netPay = 0;
      }

      if (exceptionMessages.length > 0) {
        exceptionsCount++;
      }

      employeesCount++;
      totalNetPay += netPay;

      // =========================
      // BR36 – store breakdown
      // =========================
      bulkOperations.push({
        insertOne: {
          document: {
            employeeId: new Types.ObjectId(e.employeeId),
            payrollRunId: run._id,
            baseSalary: e.baseSalary,
            bonus,
            benefit,
            deductions,
            netPay,
            exceptions:
              exceptionMessages.length > 0
                ? exceptionMessages.join('|')
                : undefined,
          },
        },
      });
    }

    if (bulkOperations.length > 0) {
      await this.employeePayrollDetailsModel.bulkWrite(bulkOperations);
    }

    // نحدّث ملخّص الـ run
    run.employees = employeesCount;
    run.totalnetpay = totalNetPay;
    run.exceptions = exceptionsCount;
    run.status = PayRollStatus.DRAFT; // لسه draft قبل الـ review
    await run.save();

    return {
      runId,
      employees: employeesCount,
      totalNetPay,
      exceptions: exceptionsCount,
    };
  }

  private async updateRunSummaryFromDetails(run: any, details: any[]) {
    const employeesCount = details.length;
    const totalNet = details.reduce(
      (sum, d: any) => sum + (d.netPay ?? 0),
      0,
    );
    const exceptionsCount = details.filter((d: any) => !!d.exceptions).length;

    run.employees = employeesCount;
    run.totalnetpay = totalNet;
    run.exceptions = exceptionsCount;
    await run.save();
  }

  async getRunExceptions(runId: string) {
    const run: any = await this.getRunByRunId(runId);

    return this.employeePayrollDetailsModel
      .find({
        payrollRunId: run._id,
        exceptions: { $exists: true, $ne: null },
      })
      .populate('employeeId')
      .exec();
  }

  // ---------------------------------------------------------------------------
  // Phase 4: Generate Payslips from employeePayrollDetails
  // ---------------------------------------------------------------------------

  async generatePayslipsForRun(runId: string) {
    const run: any = await this.getRunByRunId(runId);

    const details = await this.employeePayrollDetailsModel
      .find({ payrollRunId: run._id })
      .exec();

    if (!details.length) {
      throw new BadRequestException(
        'No employee payroll details found for this run',
      );
    }

    // Load penalties once for this run
    const penaltyDocs = await this.employeePenaltiesModel
      .find({ payrollRunId: run._id })
      .exec();
    const penaltiesMap = this.buildPenaltiesMap(penaltyDocs);

    // Clear old payslips
    await this.payslipModel.deleteMany({ payrollRunId: run._id }).exec();

    let totalNet = 0;
    let exceptionsCount = 0;

    for (const doc of details) {
      const d: any = doc;

      const employeeId = d.employeeId;
      const empKey = employeeId?.toString?.() ?? '';
      const penaltiesAmount = penaltiesMap.get(empKey) ?? 0;

      const baseSalary = d.baseSalary ?? 0;
      const allowances = d.allowances ?? 0;
      const bonus = d.bonus ?? 0;
      const benefit = d.benefit ?? 0;
      const refunds = d.refunds ?? 0;
      const overtimeAmount = d.overtimeAmount ?? 0;

      const taxAmount = d.taxAmount ?? 0;
      const insuranceAmount = d.insuranceAmount ?? 0;
      const unpaidLeaveAmount = d.unpaidLeaveAmount ?? 0;

      const gross =
        baseSalary + allowances + bonus + benefit + refunds + overtimeAmount;

      const totalDeductions =
        taxAmount + insuranceAmount + unpaidLeaveAmount + penaltiesAmount;

      const netPay = d.netPay ?? gross - totalDeductions;

      totalNet += netPay;

      if (d.exceptions) {
        exceptionsCount++;
      }

      await this.payslipModel.create({
        employeeId,
        payrollRunId: run._id,
        earningsDetails: {} as any,
        deductionsDetails: {} as any,
        totalGrossSalary: gross,
        totaDeductions: totalDeductions,
        netPay,
        paymentStatus: PaySlipPaymentStatus.PENDING,
      });
    }

    run.employees = details.length;
    run.totalnetpay = totalNet;
    run.exceptions = exceptionsCount;
    await run.save();

    return {
      runId,
      employees: details.length,
      totalNet,
      exceptions: exceptionsCount,
    };
  }

  async getPayslipsForRun(runId: string) {
    const run: any = await this.getRunByRunId(runId);

    return this.payslipModel
      .find({ payrollRunId: run._id })
      .populate('employeeId')
      .exec();
  }

  async getEmployeePayslip(runId: string, employeeId: string) {
    const run: any = await this.getRunByRunId(runId);

    const payslip = await this.payslipModel
      .findOne({
        payrollRunId: run._id,
        employeeId: new Types.ObjectId(employeeId),
      })
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found for this employee & run');
    }

    return payslip;
  }
}
