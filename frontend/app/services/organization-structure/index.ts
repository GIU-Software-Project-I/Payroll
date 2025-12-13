import apiService from '../api';

export const organizationStructureService = {
  getStructure: async () => {
    return apiService.get('/organization/structure');
  },

  createDepartment: async (data: any) => {
    return apiService.post('/organization/department', data);
  },

  updateDepartment: async (id: string, data: any) => {
    return apiService.patch(`/organization/department/${id}`, data);
  },

  createPosition: async (data: any) => {
    return apiService.post('/organization/position', data);
  },

  updatePosition: async (id: string, data: any) => {
    return apiService.patch(`/organization/position/${id}`, data);
  },

  getPositionHistory: async (id: string) => {
    return apiService.get(`/organization/position/${id}/history`);
  },

  deactivatePosition: async (id: string) => {
    return apiService.patch(`/organization/position/${id}/deactivate`);
  },
};

