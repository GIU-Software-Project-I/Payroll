//payroll-execution/controller/payroll-execution.controller.ts
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PayrollExecutionService } from '../services/payroll-execution.service';
import { BenefitStatus, BonusStatus } from '../enums/payroll-execution-enum';

@Controller('payroll-execution')
export class PayrollExecutionController {
  constructor(private readonly service: PayrollExecutionService) {}

  // -------- Phase 0: Signing Bonus --------

  @Get('signing-bonus/pending')
  getPendingSigningBonuses() {
    return this.service.getPendingSigningBonuses();
  }

  @Patch('signing-bonus/:id/approve')
  approveSigningBonus(@Param('id') id: string) {
    return this.service.approveSigningBonus(id);
  }

  @Patch('signing-bonus/:id/reject')
  rejectSigningBonus(@Param('id') id: string) {
    return this.service.rejectSigningBonus(id);
  }

  @Patch('signing-bonus/:id/edit')
  editSigningBonus(
    @Param('id') id: string,
    @Body()
    body: {
      paymentDate?: string | Date;
      status?: BonusStatus; // لازم تبقى من الـ enum
      signingBonusId?: string;
    },
  ) {
    return this.service.editSigningBonus(id, body);
  }

  // -------- Phase 0: Termination / Resignation benefits --------

  @Get('termination-benefits/pending')
  getPendingTerminationBenefits() {
    return this.service.getPendingTerminationBenefits();
  }

  @Patch('termination-benefits/:id/approve')
  approveTerminationBenefit(@Param('id') id: string) {
    return this.service.approveTerminationBenefit(id);
  }

  @Patch('termination-benefits/:id/reject')
  rejectTerminationBenefit(@Param('id') id: string) {
    return this.service.rejectTerminationBenefit(id);
  }

  @Patch('termination-benefits/:id/edit')
  editTerminationBenefit(
    @Param('id') id: string,
    @Body()
    body: {
      paymentDate?: string | Date;
      status?: BenefitStatus; // من الـ enum
      benefitId?: string;
    },
  ) {
    return this.service.editTerminationBenefit(id, body);
  }

  // -------- Payroll Runs --------

  @Post('runs')
  createRun(
    @Body()
    body: {
      runId: string;
      payrollPeriod: string | Date;
      entity: string;
      payrollSpecialistId: string;
      payrollManagerId: string; // required عشان الـ schema
    },
  ) {
    return this.service.createRun(body);
  }

  @Get('runs')
  getAllRuns() {
    return this.service.getAllRuns();
  }

  @Get('runs/:runId')
  getRun(@Param('runId') runId: string) {
    return this.service.getRunByRunId(runId);
  }

  // ======= 1.1 Payroll Draft Generation (REQ-PY-1) =======
  @Post('runs/:runId/generate-draft')
  generateDraftForRun(
    @Param('runId') runId: string,
    @Body()
    body: {
      employees: {
        employeeId: string;
        baseSalary: number;
        // earnings
        allowances?: number;
        signingBonus?: number;
        resignationBenefit?: number;
        refunds?: number;
        // deductions
        taxAmount: number;
        insuranceAmount: number;
        unpaidLeaveAmount?: number;
        penaltiesAmount?: number;
        // validations
        hasActiveContract: boolean;
        hasValidBankAccount: boolean;
      }[];
    },
  ) {
    return this.service.generateDraftForRun(runId, body.employees);
  }

  @Patch('runs/:runId/submit')
  submitRun(@Param('runId') runId: string) {
    return this.service.submitRunForReview(runId);
  }

  @Patch('runs/:runId/manager-approve')
  managerApproveRun(
    @Param('runId') runId: string,
    @Body() body: { managerId: string },
  ) {
    return this.service.managerApproveRun(runId, body.managerId);
  }

  @Patch('runs/:runId/finance-approve')
  financeApproveRun(
    @Param('runId') runId: string,
    @Body() body: { financeStaffId: string },
  ) {
    return this.service.financeApproveRun(runId, body.financeStaffId);
  }

  @Patch('runs/:runId/reject')
  rejectRun(
    @Param('runId') runId: string,
    @Body() body: { reason: string },
  ) {
    return this.service.rejectRun(runId, body.reason);
  }

  @Patch('runs/:runId/lock')
  lockRun(@Param('runId') runId: string) {
    return this.service.lockRun(runId);
  }

  @Patch('runs/:runId/unlock')
  unlockRun(
    @Param('runId') runId: string,
    @Body() body: { reason: string },
  ) {
    return this.service.unlockRun(runId, body.reason);
  }

  @Get('runs/:runId/exceptions')
  getRunExceptions(@Param('runId') runId: string) {
    return this.service.getRunExceptions(runId);
  }

  // -------- Payslips --------

  @Post('runs/:runId/generate-payslips')
  generatePayslips(@Param('runId') runId: string) {
    return this.service.generatePayslipsForRun(runId);
  }

  @Get('runs/:runId/payslips')
  getPayslips(@Param('runId') runId: string) {
    return this.service.getPayslipsForRun(runId);
  }

  @Get('runs/:runId/payslips/:employeeId')
  getEmployeePayslip(
    @Param('runId') runId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.getEmployeePayslip(runId, employeeId);
  }
}
