import apiService from '../api';

export const performanceService = {
  getAppraisalTemplates: async () => {
    return apiService.get('/performance/templates');
  },

  createAppraisalTemplate: async (data: any) => {
    return apiService.post('/performance/templates', data);
  },

  getAppraisalCycles: async () => {
    return apiService.get('/performance/cycles');
  },

  createAppraisalCycle: async (data: any) => {
    return apiService.post('/performance/cycles', data);
  },

  getMyAppraisal: async () => {
    return apiService.get('/performance/my-appraisal');
  },

  submitAppraisal: async (employeeId: string, data: any) => {
    return apiService.post(`/performance/appraisal/${employeeId}`, data);
  },

  getAppraisalHistory: async () => {
    return apiService.get('/performance/history');
  },

  submitFeedback: async (data: any) => {
    return apiService.post('/performance/feedback', data);
  },

  raiseDispute: async (appraisalId: string, data: any) => {
    return apiService.post(`/performance/appraisal/${appraisalId}/dispute`, data);
  },

  resolveDispute: async (disputeId: string, data: any) => {
    return apiService.patch(`/performance/dispute/${disputeId}/resolve`, data);
  },
};

