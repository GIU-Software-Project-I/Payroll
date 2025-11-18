



import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeavesService } from '../services/Leaves-Service';

@Controller('api')
export class LeaveController {
  constructor(private readonly integrationService: LeavesService) {}

  // Employee Endpoints
  @Get('employees')
  getAllEmployees() {
    return this.integrationService.getAllEmployees();
  }

  @Get('employees/:id')
  getEmployee(@Param('id') id: string) {
    return this.integrationService.getEmployee(id);
  }

  @Post('employees')
  createEmployee(@Body() body: any) {
    return this.integrationService.createEmployee(body);
  }

  @Put('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateEmployee(id, body);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEmployee(@Param('id') id: string) {
    return this.integrationService.deleteEmployee(id);
  }

  // Leave Type Endpoints
  @Get('leave-types')
  getAllLeaveTypes() {
    return this.integrationService.getAllLeaveTypes();
  }

  @Get('leave-types/:id')
  getLeaveType(@Param('id') id: string) {
    return this.integrationService.getLeaveType(id);
  }

  @Post('leave-types')
  createLeaveType(@Body() body: any) {
    return this.integrationService.createLeaveType(body);
  }

  @Put('leave-types/:id')
  updateLeaveType(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateLeaveType(id, body);
  }

  @Delete('leave-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeaveType(@Param('id') id: string) {
    return this.integrationService.deleteLeaveType(id);
  }

  // Leave Balance Endpoints
  @Get('leave-balances')
  getAllLeaveBalances() {
    return this.integrationService.getAllLeaveBalances();
  }

  @Get('leave-balances/:id')
  getLeaveBalance(@Param('id') id: string) {
    return this.integrationService.getLeaveBalance(id);
  }

  @Get('leave-balances/employee/:employeeId')
  getLeaveBalancesByEmployee(@Param('employeeId') employeeId: string) {
    return this.integrationService.getLeaveBalancesByEmployee(employeeId);
  }

  @Post('leave-balances')
  createLeaveBalance(@Body() body: any) {
    return this.integrationService.createLeaveBalance(body);
  }

  @Put('leave-balances/:id')
  updateLeaveBalance(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateLeaveBalance(id, body);
  }

  @Delete('leave-balances/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeaveBalance(@Param('id') id: string) {
    return this.integrationService.deleteLeaveBalance(id);
  }

  // Leave Request Endpoints
  @Get('leave-requests')
  getAllLeaveRequests() {
    return this.integrationService.getAllLeaveRequests();
  }

  @Get('leave-requests/:id')
  getLeaveRequest(@Param('id') id: string) {
    return this.integrationService.getLeaveRequest(id);
  }

  @Get('leave-requests/employee/:employeeId')
  getLeaveRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return this.integrationService.getLeaveRequestsByEmployee(employeeId);
  }

  @Post('leave-requests')
  createLeaveRequest(@Body() body: any) {
    return this.integrationService.createLeaveRequest(body);
  }

  @Put('leave-requests/:id')
  updateLeaveRequest(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateLeaveRequest(id, body);
  }

  @Delete('leave-requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeaveRequest(@Param('id') id: string) {
    return this.integrationService.deleteLeaveRequest(id);
  }

  // Leave Approval Endpoints
  @Get('leave-approvals')
  getAllLeaveApprovals() {
    return this.integrationService.getAllLeaveApprovals();
  }

  @Get('leave-approvals/:id')
  getLeaveApproval(@Param('id') id: string) {
    return this.integrationService.getLeaveApproval(id);
  }

  @Get('leave-approvals/request/:leaveRequestId')
  getLeaveApprovalsByRequest(@Param('leaveRequestId') leaveRequestId: string) {
    return this.integrationService.getLeaveApprovalsByRequest(leaveRequestId);
  }

  @Post('leave-approvals')
  createLeaveApproval(@Body() body: any) {
    return this.integrationService.createLeaveApproval(body);
  }

  @Put('leave-approvals/:id')
  updateLeaveApproval(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateLeaveApproval(id, body);
  }

  @Delete('leave-approvals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeaveApproval(@Param('id') id: string) {
    return this.integrationService.deleteLeaveApproval(id);
  }

  // Leave Balance Adjustment Endpoints
  @Get('leave-balance-adjustments')
  getAllLeaveBalanceAdjustments() {
    return this.integrationService.getAllLeaveBalanceAdjustments();
  }

  @Get('leave-balance-adjustments/:id')
  getLeaveBalanceAdjustment(@Param('id') id: string) {
    return this.integrationService.getLeaveBalanceAdjustment(id);
  }

  @Get('leave-balance-adjustments/employee/:employeeId')
  getLeaveBalanceAdjustmentsByEmployee(@Param('employeeId') employeeId: string) {
    return this.integrationService.getLeaveBalanceAdjustmentsByEmployee(employeeId);
  }

  @Post('leave-balance-adjustments')
  createLeaveBalanceAdjustment(@Body() body: any) {
    return this.integrationService.createLeaveBalanceAdjustment(body);
  }

  @Put('leave-balance-adjustments/:id')
  updateLeaveBalanceAdjustment(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateLeaveBalanceAdjustment(id, body);
  }

  @Delete('leave-balance-adjustments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeaveBalanceAdjustment(@Param('id') id: string) {
    return this.integrationService.deleteLeaveBalanceAdjustment(id);
  }

  // Calendar Holiday Endpoints
  @Get('holidays')
  getAllCalendarHolidays() {
    return this.integrationService.getAllCalendarHolidays();
  }

  @Get('holidays/:id')
  getCalendarHoliday(@Param('id') id: string) {
    return this.integrationService.getCalendarHoliday(id);
  }

  @Post('holidays')
  createCalendarHoliday(@Body() body: any) {
    return this.integrationService.createCalendarHoliday(body);
  }

  @Put('holidays/:id')
  updateCalendarHoliday(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateCalendarHoliday(id, body);
  }

  @Delete('holidays/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCalendarHoliday(@Param('id') id: string) {
    return this.integrationService.deleteCalendarHoliday(id);
  }


}
