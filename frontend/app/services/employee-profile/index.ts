import apiService from '../api';

export const employeeProfileService = {
  getProfile: async (id: string) => {
    return apiService.get(`/employee/${id}`);
  },

  updateProfile: async (id: string, data: any) => {
    return apiService.put(`/employee/${id}`, data);
  },

  requestCorrection: async (id: string, data: any) => {
    return apiService.post(`/employee/${id}/correction-request`, data);
  },

  getChangeRequests: async (id: string) => {
    return apiService.get(`/employee/${id}/changes/pending`);
  },

  approveChange: async (employeeId: string, changeId: string) => {
    return apiService.patch(`/employee/${employeeId}/changes/${changeId}/approve`);
  },
};

