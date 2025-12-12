// src/leaves/controllers/unified-leave.controller.ts
import { 
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UnifiedLeaveService } from '../services/leaves.service';
import { CreateLeaveTypeDto } from '../dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave-type.dto';
import { CreateLeaveCategoryDto } from '../dto/create-leave-category.dto';
import { AdjustBalanceDto } from '../dto/adjust-balance.dto';
import { CreateEntitlementDto } from '../dto/create-entitlement.dto';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

@Controller('leaves')
export class UnifiedLeaveController {
  constructor(private readonly service: UnifiedLeaveService) {}

  // -------------------------
  // Leave Types
  // -------------------------

  // Sick usage (generic, but can be used for SICK type)
@Get('employees/:employeeId/leave-usage')
async getLeaveUsageLastYears(
  @Param('employeeId') employeeId: string,
  @Query('leaveTypeId') leaveTypeId: string,
  @Query('years') years?: string,
) {
  const yearsNum = years ? Number(years) : 3;
  return this.service.getLeaveUsageLastYears(employeeId, leaveTypeId, yearsNum);
}

// Maternity count (or any special type)
@Get('employees/:employeeId/leave-count')
async getLeaveCountForType(
  @Param('employeeId') employeeId: string,
  @Query('leaveTypeId') leaveTypeId: string,
) {
  return this.service.getLeaveCountForType(employeeId, leaveTypeId);
}

  @Post('types')
  async createLeaveType(@Body() dto: CreateLeaveTypeDto, @Req() req) {
  //  if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.createLeaveType(dto);
  }

  @Get('types')
  async getAllLeaveTypes() {
    return this.service.getAllLeaveTypes();
  }

  @Get('types/:id')
  async getLeaveType(@Param('id') id: string) {
    return this.service.getLeaveType(id);
  }

  @Put('types/:id')
  async updateLeaveType(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
    @Req() req,
  ) {
   // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.updateLeaveType(id, dto);
  }

  @Delete('types/:id')
  async deleteLeaveType(@Param('id') id: string, @Req() req) {
   // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.deleteLeaveType(id);
  }
    // -------------------------
  // Leave eligibility
  // -------------------------
@Patch('types/:id/eligibility')
async setEligibility(
  @Param('id') id: string,
  @Body() body: any,
  @Req() req,
) {
 // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
  return this.service.updateLeaveType(id, { eligibility: body });
}

  // -------------------------
  // Leave Categories
  // -------------------------
  @Post('categories')
  async createCategory(@Body() dto: CreateLeaveCategoryDto, @Req() req) {
   // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.createCategory(dto);
  }

  @Get('categories')
  async getAllCategories() {
    return this.service.getAllCategories();
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return this.service.getCategory(id);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLeaveCategoryDto>,
    @Req() req,
  ) {
   // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string, @Req() req) {
   // if (!req.user || req.user.role !== 'HR_ADMIN') throw new ForbiddenException();
    return this.service.deleteCategory(id);
  }

  // -------------------------
  // Leave Requests
  // -------------------------
  @Post('requests')
  async createRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.service.createLeaveRequest(dto as any);
  }

  @Get('requests')
  async getAllRequests() {
    return this.service.getAllRequests();
  }

  @Get('requests/:id')
  async getRequest(@Param('id') id: string) {
    return this.service.getRequest(id);
  }

  @Patch('requests/:id')
  async updateRequest(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLeaveRequestDto>,
  ) {
    return this.service.updateRequest(id, dto as any);
  }

  @Patch('requests/:id/cancel')
  async cancelRequest(
    @Param('id') id: string,
    @Query('employeeId') employeeId: string,
  ) {
    return this.service.cancelRequest(id, employeeId);
  }

  @Patch('requests/:id/manager-approve')
  async managerApprove(
    @Param('id') id: string,
    @Query('managerId') managerId: string,
  ) {
    return this.service.managerApprove(id, managerId);
  }

  @Patch('requests/:id/manager-reject')
  async managerReject(
    @Param('id') id: string,
    @Query('managerId') managerId: string,
  ) {
    return this.service.managerReject(id, managerId);
  }

  @Patch('requests/:id/hr-finalize')
  async hrFinalize(
    @Param('id') id: string,
    @Query('hrId') hrId: string,
    @Query('decision') decision: 'approve' | 'reject',
    
  ) {
    return this.service.hrFinalize(id, hrId, decision);
  }

  // -------------------------
  // Leave Adjustments
  // -------------------------
  @Post('adjustments')
  async createAdjustment(@Body() dto: AdjustBalanceDto) {
    return this.service.createAdjustment(dto as any);
  }

  // -------------------------
  // Entitlements
  // -------------------------
  @Post('entitlements')
  async createEntitlement(@Body() dto: CreateEntitlementDto) {
    return this.service.createEntitlement(dto);
  }

  @Get('entitlements/:employeeId')
  async getEntitlements(@Param('employeeId') employeeId: string) {
    return this.service.getEntitlements(employeeId);
  }

  // assign personalized entitlement (uses assignEntitlement in service)
  @Post('entitlements/assign')
  async assignEntitlement(
    @Body() body: { employeeId: string; leaveTypeId: string; yearlyEntitlement: number },
  ) {
    return this.service.assignEntitlement(
      body.employeeId,
      body.leaveTypeId,
      body.yearlyEntitlement,
    );
  }

  // -------------------------
  // employee Self-Service Views
  // -------------------------
  @Get('employees/:employeeId/balances')
  async getEmployeeBalances(@Param('employeeId') employeeId: string) {
    return this.service.getEmployeeBalances(employeeId);
  }

  @Get('employees/:employeeId/history')
  async getEmployeeHistory(
    @Param('employeeId') employeeId: string,
    @Query()
    query: {
      leaveTypeId?: string;
      status?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
      sort?: string;
    },
  ) {
    return this.service.getEmployeeHistory(employeeId, query);
  }

  // -------------------------
  // Manager Views
  // -------------------------
  @Get('manager/:managerId/team-balances')
  async teamBalances(
    @Param('managerId') managerId: string,
    @Query('department') department?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
  ) {
    return this.service.teamBalances(managerId, { department, leaveTypeId });
  }

  @Get('manager/:managerId/team-requests')
  async teamRequests(
    @Param('managerId') managerId: string,
    @Query()
    query: {
      leaveTypeId?: string;
      status?: string;
      department?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
      sort?: string;
    },
  ) {
    return this.service.teamRequests(managerId, query);
  }

  @Get('manager/:managerId/irregular-patterns')
  async irregularPatterns(
    @Param('managerId') managerId: string,
    @Query('department') department?: string,
  ) {
    return this.service.irregularPatterns(managerId, { department });
  }

  @Post('manager/flag-irregular/:requestId')
  async flagIrregular(
    @Param('requestId') requestId: string,
    @Body() body: { flag: boolean; reason?: string },
  ) {
    return this.service.flagIrregular(
      requestId,
      body.flag ?? true,
      body.reason,
    );
  }

  // -------------------------
  // Calendar / Holidays / Blocked Periods
  // -------------------------
  @Post('calendar/holidays')
  async addHoliday(
    @Body()
    body: { year: number; date: string; reason?: string },
  ) {
    const year = Number(body.year);
    const date = new Date(body.date);
    return this.service.addHoliday(year, date, body.reason);
  }

  @Post('calendar/blocked-periods')
  async addBlockedPeriod(
    @Body()
    body: { year: number; from: string; to: string; reason: string },
  ) {
    const year = Number(body.year);
    const from = new Date(body.from);
    const to = new Date(body.to);
    return this.service.addBlockedPeriod(year, from, to, body.reason);
  }

  @Get('calendar/:year')
  async getCalendar(@Param('year') year: string) {
    return this.service.getCalendar(Number(year));
  }

  // -------------------------
  // Accruals
  // -------------------------
@Post('accruals/run')
async runAccrual(
  @Query('referenceDate') referenceDate?: string,
  @Body()
  body?: {
    method?: AccrualMethod;
    roundingRule?: RoundingRule;
  },
) {
  const method = body?.method ?? AccrualMethod.MONTHLY;
  const roundingRule = body?.roundingRule ?? RoundingRule.ROUND;
  return this.service.runAccrual(referenceDate, method, roundingRule);
}


@Post('accruals/carryforward')
async carryForward(
  @Query('referenceDate') referenceDate?: string,
  @Body()
  body?: {
    capDays?: number;
    expiryMonths?: number;
  },
) {
  const capDays = body?.capDays;
  const expiryMonths = body?.expiryMonths;
  return this.service.carryForward(referenceDate, capDays, expiryMonths);
}


  @Get('accruals/employee/:id/recalc')
  async recalcEmployee(@Param('id') id: string) {
    return this.service.recalcEmployee(id);
  }

  @Post('accruals/reset-year')
  async resetLeaveYear(
    @Body()
    body: {
      strategy: 'hireDate' | 'calendarYear' | 'custom';
      referenceDate?: string;
    },
  ) {
    const referenceDate = body.referenceDate
      ? new Date(body.referenceDate)
      : undefined;
    return this.service.resetLeaveYear(body.strategy, referenceDate);
  }

  @Post('accruals/adjust-suspension')
  async adjustSuspension(
    @Body()
    body: { employeeId: string; fromDate: string; toDate: string; reason?: string },
  ) {
    // استخدم calculateServiceDays لأنه closest لوظيفه تعليق الاستحقاقات
    const { employeeId, fromDate, toDate, reason } = body;
    const serviceDays = await this.service.calculateServiceDays(
      employeeId,
      new Date(fromDate),
      new Date(toDate),
    );
    return { employeeId, fromDate, toDate, serviceDays, reason };
  }

  // -------------------------
  // Attachments
  // -------------------------
  @Post('attachments')
  async saveAttachment(@Body() dto: any) {
    return this.service.saveAttachment(dto);
  }

  @Get('attachments/:id/validate-medical')
  async validateMedicalAttachment(@Param('id') id: string) {
    return this.service.validateMedicalAttachment(id);
  }

  // -------------------------
  // Bulk Processing
  // -------------------------
  @Post('requests/bulk-process')
  async bulkProcessRequests(
    @Body()
    body: { requestIds: string[]; action: 'approve' | 'reject'; actorId: string },
  ) {
    return this.service.bulkProcessRequests(
      body.requestIds,
      body.action,
      body.actorId,
    );
  }

  // -------------------------
  // Payroll
  // -------------------------
  @Post('payroll/sync-balance')
  async payrollSyncBalance(
    @Body() body: { employeeId: string; balanceData?: any },
  ) {
    return this.service.payrollSyncBalance(
      body.employeeId,
      body.balanceData,
    );
  }

  @Post('payroll/sync-leave-approval')
  async payrollSyncLeave(@Body() body: { employeeId: string; leaveData: any }) {
    return this.service.payrollSyncLeave(body.employeeId, body.leaveData);
  }

  @Post('payroll/calculate-unpaid-deduction')
  async calculateUnpaidDeduction(
    @Body()
    body: {
      employeeId: string;
      baseSalary: number;
      workDaysInMonth: number;
      unpaidLeaveDays: number;
    },
  ) {
    return this.service.calculateUnpaidDeduction(
      body.employeeId,
      body.baseSalary,
      body.workDaysInMonth,
      body.unpaidLeaveDays,
    );
  }

  @Post('payroll/calculate-encashment')
  async calculateEncashment(
    @Body()
    body: {
      employeeId: string;
      dailySalaryRate: number;
      unusedLeaveDays: number;
      maxEncashableDays?: number;
    },
  ) {
    return this.service.calculateEncashment(
      body.employeeId,
      body.dailySalaryRate,
      body.unusedLeaveDays,
      body.maxEncashableDays,
    );
  }

  @Post('payroll/sync-cancellation')
  async syncCancellation(
    @Body()
    body: {
      employeeId: string;
      leaveRequestId: string;
      daysToRestore: number;
    },
  ) {
    return this.service.syncCancellation(
      body.employeeId,
      body.leaveRequestId,
      body.daysToRestore,
    );
  }
}
