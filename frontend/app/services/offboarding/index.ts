import apiService from '../api';

export const offboardingService = {
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

