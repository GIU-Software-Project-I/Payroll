import apiService from '../api';

export const leavesService = {
  submitRequest: async (data: any) => {
    return apiService.post('/leaves/request', data);
  },

  getMyRequests: async () => {
    return apiService.get('/leaves/my-requests');
  },

  getBalance: async () => {
    return apiService.get('/leaves/balance');
  },

  updateRequest: async (id: string, data: any) => {
    return apiService.patch(`/leaves/${id}`, data);
  },

  cancelRequest: async (id: string) => {
    return apiService.delete(`/leaves/${id}`);
  },

  getTeamLeaves: async () => {
    return apiService.get('/leaves/team');
  },

  approveRequest: async (id: string, data: any) => {
    return apiService.patch(`/leaves/${id}/approve`, data);
  },

  rejectRequest: async (id: string, data: any) => {
    return apiService.patch(`/leaves/${id}/reject`, data);
  },
};

