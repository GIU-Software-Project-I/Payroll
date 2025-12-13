import apiService from '../api';

export const recruitmentService = {
  getJobPostings: async () => {
    return apiService.get('/recruitment/jobs');
  },

  createJobPosting: async (data: any) => {
    return apiService.post('/recruitment/jobs', data);
  },

  getJobPosting: async (id: string) => {
    return apiService.get(`/recruitment/jobs/${id}`);
  },

  submitApplication: async (data: any) => {
    return apiService.post('/recruitment/application', data);
  },

  getApplicationStatus: async (id: string) => {
    return apiService.get(`/recruitment/application/${id}/status`);
  },

  getCandidates: async () => {
    return apiService.get('/recruitment/candidates');
  },

  updateCandidateStatus: async (id: string, data: any) => {
    return apiService.patch(`/recruitment/candidate/${id}/status`, data);
  },

  scheduleInterview: async (data: any) => {
    return apiService.post('/recruitment/interview/schedule', data);
  },

  createOffer: async (data: any) => {
    return apiService.post('/recruitment/offer', data);
  },

  getOffers: async () => {
    return apiService.get('/recruitment/offers');
  },
};

