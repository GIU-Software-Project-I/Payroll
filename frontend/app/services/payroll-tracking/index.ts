import apiService from '../api';

export const payrollTrackingService = {
  getPayslip: async (id: string) => {
    return apiService.get(`/payroll/payslip/${id}`);
  },

  getPayslips: async () => {
    return apiService.get('/payroll/payslips');
  },

  downloadPayslip: async (id: string) => {
    return apiService.get(`/payroll/payslip/${id}/download`);
  },

  getSalaryHistory: async () => {
    return apiService.get('/payroll/salary-history');
  },

  getDeductions: async () => {
    return apiService.get('/payroll/deductions');
  },

  submitDispute: async (data: any) => {
    return apiService.post('/payroll/dispute', data);
  },

  getDisputes: async () => {
    return apiService.get('/payroll/disputes');
  },

  submitClaim: async (data: any) => {
    return apiService.post('/payroll/claim', data);
  },

  getClaims: async () => {
    return apiService.get('/payroll/claims');
  },
};

