import apiService from '../api';

// Types
export interface TerminationRequest {
  _id: string;
  employeeId: string | { _id: string; firstName?: string; lastName?: string };
  reason: string | { type?: string; description?: string };
  terminationDate?: string;
  status: TerminationStatus;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum TerminationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface ClearanceChecklist {
  _id: string;
  employeeId: string;
  items: ClearanceItem[];
  completed: boolean;
}

export interface ClearanceItem {
  _id?: string;
  name: string;
  department: string;
  status: 'PENDING' | 'COMPLETED' | 'NOT_APPLICABLE';
  completedBy?: string;
  completedAt?: string;
}

export const offboardingService = {
  getAllTerminationRequests: async () => {
    const res = await apiService.get('/offboarding/termination-requests');
    return res?.data || res || [];
  },

  revokeSystemAccess: async (data: { employeeId: string }) => {
    return apiService.post(`/offboarding/${data.employeeId}/revoke-access`);
  },

  initiateTermination: async (employeeId: string, data: any) => {
    return apiService.post(`/offboarding/${employeeId}/termination`, data);
  },

  getTerminationReview: async (employeeId: string) => {
    return apiService.get(`/offboarding/${employeeId}/termination-review`);
  },

  getClearanceChecklist: async (employeeId: string) => {
    return apiService.get(`/offboarding/${employeeId}/clearance-checklist`);
  },

  updateClearanceItem: async (itemId: string, data: any) => {
    return apiService.patch(`/offboarding/clearance/${itemId}`, data);
  },

  calculateFinalSettlement: async (employeeId: string) => {
    return apiService.get(`/offboarding/${employeeId}/final-settlement`);
  },

  processFinalSettlement: async (employeeId: string, data: any) => {
    return apiService.post(`/offboarding/${employeeId}/process-settlement`, data);
  },

  revokeAccess: async (employeeId: string) => {
    return apiService.post(`/offboarding/${employeeId}/revoke-access`);
  },

  submitResignation: async (data: any) => {
    return apiService.post('/offboarding/resignation', data);
  },
};

