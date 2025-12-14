import apiService from '../api';

export const onboardingService = {
  createChecklist: async (data: any) => {
    return apiService.post('/onboarding/checklist', data);
  },

  getChecklistTemplate: async (departmentId: string) => {
    return apiService.get(`/onboarding/checklist/template/${departmentId}`);
  },

  getOnboardingStatus: async (employeeId: string) => {
    return apiService.get(`/onboarding/status/${employeeId}`);
  },

  updateTaskStatus: async (taskId: string, data: any) => {
    return apiService.patch(`/onboarding/task/${taskId}`, data);
  },

  uploadDocument: async (employeeId: string, file: FormData) => {
    return apiService.post(`/onboarding/${employeeId}/documents`, file);
  },

  triggerPayrollInitiation: async (employeeId: string) => {
    return apiService.post(`/onboarding/${employeeId}/payroll-initiation`);
  },

  provisionAccess: async (employeeId: string, data: any) => {
    return apiService.post(`/onboarding/${employeeId}/provision-access`, data);
  },
};

