import api from './api';

// Types for Departmental Payroll Reports
export interface DepartmentalReport {
  id: string;
  departmentId: string;
  departmentName: string;
  period: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalTaxes: number;
  averageSalary: number;
  costCenter: string;
  generatedAt: string;
  status: 'draft' | 'final' | 'archived';
}

export interface ReportFilters {
  departmentId?: string;
  period?: string;
  status?: 'draft' | 'final' | 'archived';
  costCenter?: string;
}

export interface PayrollSummaryReport {
  id: string;
  type: 'summary' | 'tax' | 'payslip_history';
  title: string;
  period: string;
  totalAmount: number;
  employeeCount: number;
  generatedAt: string;
  downloadUrl?: string;
}

// Types for Dispute Review
export interface PayrollDispute {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  type: 'salary' | 'deduction' | 'hours' | 'other';
  description: string;
  amount?: number;
  period: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  attachments?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DisputeReviewAction {
  disputeId: string;
  action: 'approve' | 'reject';
  notes?: string;
  escalateToManager?: boolean;
}

// Types for Expense Claims
export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  title: string;
  description: string;
  amount: number;
  category: 'travel' | 'meals' | 'supplies' | 'training' | 'other';
  submittedAt: string;
  period: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  receipts: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ClaimReviewAction {
  claimId: string;
  action: 'approve' | 'reject';
  notes?: string;
  escalateToManager?: boolean;
}

// API Service Functions
export const payrollSpecialistService = {
  // Departmental Reports
  async getDepartmentalReports(filters?: ReportFilters) {
    const params = new URLSearchParams();
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.period) params.append('period', filters.period);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.costCenter) params.append('costCenter', filters.costCenter);

    const response = await api.get<DepartmentalReport[]>(`/payroll/reports/departmental?${params}`);
    return response;
  },

  async generateDepartmentalReport(departmentId: string, period: string) {
    const response = await api.post<DepartmentalReport>('/payroll/reports/departmental/generate', {
      departmentId,
      period,
    });
    return response;
  },

  async getPayrollSummaryReports() {
    const response = await api.get<PayrollSummaryReport[]>('/payroll/reports/summary');
    return response;
  },

  async downloadReport(reportId: string) {
    const response = await api.get<Blob>(`/payroll/reports/${reportId}/download`);
    return response;
  },

  // Dispute Management
  async getPendingDisputes() {
    const response = await api.get<PayrollDispute[]>('/payroll/disputes/pending');
    return response;
  },

  async getAllDisputes(status?: PayrollDispute['status']) {
    const params = status ? `?status=${status}` : '';
    const response = await api.get<PayrollDispute[]>(`/payroll/disputes${params}`);
    return response;
  },

  async reviewDispute(action: DisputeReviewAction) {
    const response = await api.post<PayrollDispute>('/payroll/disputes/review', action);
    return response;
  },

  async getDisputeDetails(disputeId: string) {
    const response = await api.get<PayrollDispute>(`/payroll/disputes/${disputeId}`);
    return response;
  },

  // Expense Claims Management
  async getPendingClaims() {
    const response = await api.get<ExpenseClaim[]>('/payroll/claims/pending');
    return response;
  },

  async getAllClaims(status?: ExpenseClaim['status']) {
    const params = status ? `?status=${status}` : '';
    const response = await api.get<ExpenseClaim[]>(`/payroll/claims${params}`);
    return response;
  },

  async reviewClaim(action: ClaimReviewAction) {
    const response = await api.post<ExpenseClaim>('/payroll/claims/review', action);
    return response;
  },

  async getClaimDetails(claimId: string) {
    const response = await api.get<ExpenseClaim>(`/payroll/claims/${claimId}`);
    return response;
  },
};
