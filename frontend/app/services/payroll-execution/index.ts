import apiService from '../api';

export const payrollExecutionService = {
  createPayrollRun: async (data: any) => {
    return apiService.post('/payroll/run/create', data);
  },

  getPayrollRun: async (id: string) => {
    return apiService.get(`/payroll/run/${id}`);
  },

  getPayrollRuns: async () => {
    return apiService.get('/payroll/runs');
  },

  draftPayroll: async (data: any) => {
    return apiService.post('/payroll/draft', data);
  },

  processPayroll: async (id: string, data: any) => {
    return apiService.post(`/payroll/run/${id}/process`, data);
  },

  approvePayroll: async (id: string) => {
    return apiService.patch(`/payroll/run/${id}/approve`);
  },

  rejectPayroll: async (id: string) => {
    return apiService.patch(`/payroll/run/${id}/reject`);
  },

  freezePayroll: async (id: string) => {
    return apiService.patch(`/payroll/run/${id}/freeze`);
  },

  unfreezePayroll: async (id: string) => {
    return apiService.patch(`/payroll/run/${id}/unfreeze`);
  },
};

