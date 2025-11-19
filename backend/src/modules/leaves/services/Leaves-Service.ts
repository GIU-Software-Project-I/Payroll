import { Injectable } from '@nestjs/common';

// Define types based on your models
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
}

interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  isPaid: boolean;
  description?: string;
}

interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  availableDays: number;
  year: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalDays: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface LeaveApproval {
  id: string;
  leaveRequestId: string;
  approverId: string;
  status: 'approved' | 'rejected';
  comments?: string;
  approvedAt: Date;
}

interface LeaveBalanceAdjustment {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  adjustmentDays: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: Date;
}

interface CalendarHoliday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  country?: string;
}

// Dummy data stores
let employees: Employee[] = [
  { id: 'EMP001', name: 'John Doe', department: 'Engineering', position: 'Software Engineer', email: 'john@example.com' },
  { id: 'EMP002', name: 'Jane Smith', department: 'HR', position: 'HR Manager', email: 'jane@example.com' }
];

let leaveTypes: LeaveType[] = [
  { id: 'LT001', name: 'Annual Leave', maxDays: 20, isPaid: true, description: 'Yearly vacation leave' },
  { id: 'LT002', name: 'Sick Leave', maxDays: 10, isPaid: true, description: 'Medical leave' }
];

let leaveBalances: LeaveBalance[] = [
  { id: 'LB001', employeeId: 'EMP001', leaveTypeId: 'LT001', totalDays: 20, usedDays: 5, availableDays: 15, year: 2024 },
  { id: 'LB002', employeeId: 'EMP001', leaveTypeId: 'LT002', totalDays: 10, usedDays: 2, availableDays: 8, year: 2024 }
];

let leaveRequests: LeaveRequest[] = [
  { id: 'LR001', employeeId: 'EMP001', leaveTypeId: 'LT001', startDate: '2024-02-01', endDate: '2024-02-05', reason: 'Vacation', status: 'pending', totalDays: 5, createdAt: new Date() }
];

let leaveApprovals: LeaveApproval[] = [
  { id: 'LA001', leaveRequestId: 'LR001', approverId: 'EMP002', status: 'approved', comments: 'Approved', approvedAt: new Date() }
];

let leaveBalanceAdjustments: LeaveBalanceAdjustment[] = [
  { id: 'LBA001', employeeId: 'EMP001', leaveTypeId: 'LT001', adjustmentDays: 2, reason: 'Bonus days', adjustedBy: 'EMP002', adjustedAt: new Date() }
];

let calendarHolidays: CalendarHoliday[] = [
  { id: 'CH001', name: 'New Year', date: '2024-01-01', isRecurring: true, country: 'US' },
  { id: 'CH002', name: 'Christmas', date: '2024-12-25', isRecurring: true, country: 'US' }
];

@Injectable()
export class LeavesService {
  // Employee CRUD
  getAllEmployees(): Employee[] { return employees; }
  getEmployee(id: string): Employee | undefined { return employees.find(e => e.id === id); }
  createEmployee(data: Omit<Employee, 'id'>): Employee {
    const employee = { id: `EMP${Date.now()}`, ...data };
    employees.push(employee);
    return employee;
  }
  updateEmployee(id: string, data: Partial<Employee>): Employee | undefined {
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    employees[index] = { ...employees[index], ...data };
    return employees[index];
  }
  deleteEmployee(id: string): boolean {
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return false;
    employees.splice(index, 1);
    return true;
  }

  // Leave Type CRUD
  getAllLeaveTypes(): LeaveType[] { return leaveTypes; }
  getLeaveType(id: string): LeaveType | undefined { return leaveTypes.find(lt => lt.id === id); }
  createLeaveType(data: Omit<LeaveType, 'id'>): LeaveType {
    const leaveType = { id: `LT${Date.now()}`, ...data };
    leaveTypes.push(leaveType);
    return leaveType;
  }
  updateLeaveType(id: string, data: Partial<LeaveType>): LeaveType | undefined {
    const index = leaveTypes.findIndex(lt => lt.id === id);
    if (index === -1) return undefined;
    leaveTypes[index] = { ...leaveTypes[index], ...data };
    return leaveTypes[index];
  }
  deleteLeaveType(id: string): boolean {
    const index = leaveTypes.findIndex(lt => lt.id === id);
    if (index === -1) return false;
    leaveTypes.splice(index, 1);
    return true;
  }

  // Leave Balance CRUD
  getAllLeaveBalances(): LeaveBalance[] { return leaveBalances; }
  getLeaveBalance(id: string): LeaveBalance | undefined { return leaveBalances.find(lb => lb.id === id); }
  getLeaveBalancesByEmployee(employeeId: string): LeaveBalance[] { return leaveBalances.filter(lb => lb.employeeId === employeeId); }
  createLeaveBalance(data: Omit<LeaveBalance, 'id'>): LeaveBalance {
    const leaveBalance = { id: `LB${Date.now()}`, ...data };
    leaveBalances.push(leaveBalance);
    return leaveBalance;
  }
  updateLeaveBalance(id: string, data: Partial<LeaveBalance>): LeaveBalance | undefined {
    const index = leaveBalances.findIndex(lb => lb.id === id);
    if (index === -1) return undefined;
    leaveBalances[index] = { ...leaveBalances[index], ...data };
    return leaveBalances[index];
  }
  deleteLeaveBalance(id: string): boolean {
    const index = leaveBalances.findIndex(lb => lb.id === id);
    if (index === -1) return false;
    leaveBalances.splice(index, 1);
    return true;
  }

  // Leave Request CRUD
  getAllLeaveRequests(): LeaveRequest[] { return leaveRequests; }
  getLeaveRequest(id: string): LeaveRequest | undefined { return leaveRequests.find(lr => lr.id === id); }
  getLeaveRequestsByEmployee(employeeId: string): LeaveRequest[] { return leaveRequests.filter(lr => lr.employeeId === employeeId); }
  createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'createdAt'>): LeaveRequest {
    const leaveRequest = { id: `LR${Date.now()}`, ...data, createdAt: new Date() };
    leaveRequests.push(leaveRequest);
    return leaveRequest;
  }
  updateLeaveRequest(id: string, data: Partial<LeaveRequest>): LeaveRequest | undefined {
    const index = leaveRequests.findIndex(lr => lr.id === id);
    if (index === -1) return undefined;
    leaveRequests[index] = { ...leaveRequests[index], ...data, updatedAt: new Date() };
    return leaveRequests[index];
  }
  deleteLeaveRequest(id: string): boolean {
    const index = leaveRequests.findIndex(lr => lr.id === id);
    if (index === -1) return false;
    leaveRequests.splice(index, 1);
    return true;
  }

  // Leave Approval CRUD
  getAllLeaveApprovals(): LeaveApproval[] { return leaveApprovals; }
  getLeaveApproval(id: string): LeaveApproval | undefined { return leaveApprovals.find(la => la.id === id); }
  getLeaveApprovalsByRequest(leaveRequestId: string): LeaveApproval[] { return leaveApprovals.filter(la => la.leaveRequestId === leaveRequestId); }
  createLeaveApproval(data: Omit<LeaveApproval, 'id' | 'approvedAt'>): LeaveApproval {
    const leaveApproval = { id: `LA${Date.now()}`, ...data, approvedAt: new Date() };
    leaveApprovals.push(leaveApproval);
    return leaveApproval;
  }
  updateLeaveApproval(id: string, data: Partial<LeaveApproval>): LeaveApproval | undefined {
    const index = leaveApprovals.findIndex(la => la.id === id);
    if (index === -1) return undefined;
    leaveApprovals[index] = { ...leaveApprovals[index], ...data };
    return leaveApprovals[index];
  }
  deleteLeaveApproval(id: string): boolean {
    const index = leaveApprovals.findIndex(la => la.id === id);
    if (index === -1) return false;
    leaveApprovals.splice(index, 1);
    return true;
  }

  // Leave Balance Adjustment CRUD
  getAllLeaveBalanceAdjustments(): LeaveBalanceAdjustment[] { return leaveBalanceAdjustments; }
  getLeaveBalanceAdjustment(id: string): LeaveBalanceAdjustment | undefined { return leaveBalanceAdjustments.find(lba => lba.id === id); }
  getLeaveBalanceAdjustmentsByEmployee(employeeId: string): LeaveBalanceAdjustment[] { return leaveBalanceAdjustments.filter(lba => lba.employeeId === employeeId); }
  createLeaveBalanceAdjustment(data: Omit<LeaveBalanceAdjustment, 'id' | 'adjustedAt'>): LeaveBalanceAdjustment {
    const adjustment = { id: `LBA${Date.now()}`, ...data, adjustedAt: new Date() };
    leaveBalanceAdjustments.push(adjustment);
    return adjustment;
  }
  updateLeaveBalanceAdjustment(id: string, data: Partial<LeaveBalanceAdjustment>): LeaveBalanceAdjustment | undefined {
    const index = leaveBalanceAdjustments.findIndex(lba => lba.id === id);
    if (index === -1) return undefined;
    leaveBalanceAdjustments[index] = { ...leaveBalanceAdjustments[index], ...data };
    return leaveBalanceAdjustments[index];
  }
  deleteLeaveBalanceAdjustment(id: string): boolean {
    const index = leaveBalanceAdjustments.findIndex(lba => lba.id === id);
    if (index === -1) return false;
    leaveBalanceAdjustments.splice(index, 1);
    return true;
  }

  // Calendar Holiday CRUD
  getAllCalendarHolidays(): CalendarHoliday[] { return calendarHolidays; }
  getCalendarHoliday(id: string): CalendarHoliday | undefined { return calendarHolidays.find(ch => ch.id === id); }
  createCalendarHoliday(data: Omit<CalendarHoliday, 'id'>): CalendarHoliday {
    const holiday = { id: `CH${Date.now()}`, ...data };
    calendarHolidays.push(holiday);
    return holiday;
  }
  updateCalendarHoliday(id: string, data: Partial<CalendarHoliday>): CalendarHoliday | undefined {
    const index = calendarHolidays.findIndex(ch => ch.id === id);
    if (index === -1) return undefined;
    calendarHolidays[index] = { ...calendarHolidays[index], ...data };
    return calendarHolidays[index];
  }
  deleteCalendarHoliday(id: string): boolean {
    const index = calendarHolidays.findIndex(ch => ch.id === id);
    if (index === -1) return false;
    calendarHolidays.splice(index, 1);
    return true;
  }
}
