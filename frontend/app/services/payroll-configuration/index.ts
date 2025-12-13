import apiService from '../api';

export const payrollConfigurationService = {
  getConfiguration: async () => {
    return apiService.get('/payroll/configuration');
  },

  updateConfiguration: async (data: any) => {
    return apiService.patch('/payroll/configuration', data);
  },

  getPayGrades: async () => {
    return apiService.get('/payroll/pay-grades');
  },

  createPayGrade: async (data: any) => {
    return apiService.post('/payroll/pay-grades', data);
  },

  updatePayGrade: async (id: string, data: any) => {
    return apiService.patch(`/payroll/pay-grades/${id}`, data);
  },

  getAllowances: async () => {
    return apiService.get('/payroll/allowances');
  },

  createAllowance: async (data: any) => {
    return apiService.post('/payroll/allowances', data);
  },

  getTaxRules: async () => {
    return apiService.get('/payroll/tax-rules');
  },

  updateTaxRules: async (data: any) => {
    return apiService.patch('/payroll/tax-rules', data);
  },
};

