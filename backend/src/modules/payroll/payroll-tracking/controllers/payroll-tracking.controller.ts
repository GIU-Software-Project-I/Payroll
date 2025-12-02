import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PayrollTrackingService } from '../services/payroll-tracking.service';
import { CreateClaimDTO } from '../dto/create-claim.dto';
import { CreateDisputeDTO } from '../dto/create-dispute.dto';
import { ApproveRejectClaimDTO } from '../dto/approve-reject-claim.dto';
import { ApproveRejectDisputeDTO } from '../dto/approve-reject-dispute.dto';
import { PayslipQueryDto } from '../dto/payslip-query.dto';
import { TaxDocumentQueryDto } from '../dto/tax-document-query.dto';
import { UpdateRefundStatusDto } from '../dto/update-refund-status.dto';
import { CurrentUser } from '../../../auth/decorators/Current-User';
import { Public } from '../../../auth/decorators/Public-Decorator';
import type { JwtPayload } from '../../../auth/token/JWT-Payload';
import { ClaimStatus, DisputeStatus } from '../enums/payroll-tracking-enum';

@Controller('payroll-tracking')
export class PayrollTrackingController {
  constructor(private readonly trackingService: PayrollTrackingService) {}

  // ===== Employee-facing: payslips =====

  @Public()
  @Get('payslips/me')
  getMyPayslips(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string, @Query() query?: PayslipQueryDto) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeePayslips(empId, query || {});
  }

  @Public()
  @Get('payslips/me/history')
  getMySalaryHistory(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeSalaryHistory(empId);
  }

  @Public()
  @Get('payslips/:id')
  getMyPayslipById(@CurrentUser() user: JwtPayload | undefined, @Param('id') id: string, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeePayslipById(empId, id);
  }

  @Public()
  @Get('tax-documents/me')
  getMyTaxDocuments(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string, @Query() query?: TaxDocumentQueryDto) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeTaxDocuments(empId, query || {});
  }

  // ===== Employee-facing: disputes =====

  @Public()
  @Post('disputes')
  createDispute(@CurrentUser() user: JwtPayload | undefined, @Body() body: CreateDisputeDTO & { employeeId?: string }) {
    const empId = body.employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass in body for testing)');
    const { employeeId: _, ...dto } = body;
    return this.trackingService.createDispute(empId, dto);
  }

  @Public()
  @Get('disputes/me')
  getMyDisputes(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeDisputes(empId);
  }

  @Public()
  @Get('disputes/me/:id')
  getMyDisputeById(@CurrentUser() user: JwtPayload | undefined, @Param('id') id: string, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeDisputeById(empId, id);
  }

  // ===== Employee-facing: claims =====

  @Public()
  @Post('claims')
  createClaim(@CurrentUser() user: JwtPayload | undefined, @Body() body: CreateClaimDTO & { employeeId?: string }) {
    const empId = body.employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass in body for testing)');
    const { employeeId: _, ...dto } = body;
    return this.trackingService.createClaim(empId, dto);
  }

  @Public()
  @Get('claims/me')
  getMyClaims(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeClaims(empId);
  }

  @Public()
  @Get('claims/me/:id')
  getMyClaimById(@CurrentUser() user: JwtPayload | undefined, @Param('id') id: string, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeClaimById(empId, id);
  }

  @Public()
  @Get('refunds/me')
  getMyRefunds(@CurrentUser() user: JwtPayload | undefined, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || user?.sub;
    if (!empId) throw new Error('employeeId required (pass as query param for testing)');
    return this.trackingService.getEmployeeRefunds(empId);
  }

  // ===== Staff-facing: disputes & claims workflow =====

  @Public()
  @Get('admin/disputes')
  listDisputes(@Query('status') status?: DisputeStatus) {
    return this.trackingService.listDisputesByStatus(status);
  }

  @Public()
  @Patch('admin/disputes/:id/decision')
  decideDispute(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('id') id: string,
    @Body() body: ApproveRejectDisputeDTO & { financeStaffId?: string },
  ) {
    const financeId = body.financeStaffId || user?.sub;
    if (!financeId) throw new Error('financeStaffId required (pass in body for testing)');
    const { financeStaffId: _, ...dto } = body;
    return this.trackingService.decideDispute(id, financeId, dto);
  }

  @Public()
  @Get('admin/claims')
  listClaims(@Query('status') status?: ClaimStatus) {
    return this.trackingService.listClaimsByStatus(status);
  }

  @Public()
  @Patch('admin/claims/:id/decision')
  decideClaim(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('id') id: string,
    @Body() body: ApproveRejectClaimDTO & { financeStaffId?: string },
  ) {
    const financeId = body.financeStaffId || user?.sub;
    if (!financeId) throw new Error('financeStaffId required (pass in body for testing)');
    const { financeStaffId: _, ...dto } = body;
    return this.trackingService.decideClaim(id, financeId, dto);
  }

  @Public()
  @Patch('admin/refunds/:id/status')
  updateRefundStatus(@Param('id') id: string, @Body() dto: UpdateRefundStatusDto) {
    return this.trackingService.updateRefundStatus(id, dto);
  }
}
