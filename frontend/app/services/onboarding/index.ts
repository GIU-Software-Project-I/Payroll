import apiService from '../api';

// Types
export interface OnboardingTask {
  _id?: string;
  name: string;
  description?: string;
  status: OnboardingTaskStatus;
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
}

export interface Onboarding {
  _id: string;
  employeeId: string | { _id: string; firstName?: string; lastName?: string };
  contractId?: string | { _id: string; contractNumber?: string };
  tasks: OnboardingTask[];
  completed: boolean;
  startDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum OnboardingTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export const onboardingService = {
  getAllOnboardings: async () => {
    const res = await apiService.get('/onboarding');
    return res?.data || res || [];
  },

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

