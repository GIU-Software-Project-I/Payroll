import apiService from '../api';

export const timeManagementService = {
  clockIn: async (data: any) => {
    return apiService.post('/attendance/clock-in', data);
  },

  clockOut: async (data: any) => {
    return apiService.post('/attendance/clock-out', data);
  },

  requestCorrection: async (data: any) => {
    return apiService.post('/attendance/correction', data);
  },

  getAttendanceRecord: async () => {
    return apiService.get('/attendance/record');
  },

  getTeamAttendance: async () => {
    return apiService.get('/attendance/team');
  },

  approveCorrection: async (id: string) => {
    return apiService.patch(`/attendance/correction/${id}/approve`);
  },

  rejectCorrection: async (id: string) => {
    return apiService.patch(`/attendance/correction/${id}/reject`);
  },
};

