import apiService from '../api';

/**
 * Helper function to build query string
 */
const buildQueryString = (params: Record<string, any>): string => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return filteredParams ? `?${filteredParams}` : '';
};

/**
 * Organization Structure Service
 * Handles organization hierarchy, departments, and positions
 */
export const organizationStructureService = {
  // =============================================
  // Department Management
  // =============================================

  /**
   * Create new department
   * POST /departments
   */
  createDepartment: async (data: any) => {
    return apiService.post(`/departments`, data);
  },

  /**
   * Get all departments
   * GET /departments
   */
  getDepartments: async () => {
    return apiService.get(`/departments`);
  },

  /**
   * Search departments (paginated)
   * GET /departments/search
   */
  searchDepartments: async (q?: string, page?: number, limit?: number) => {
    const query = buildQueryString({ q, page, limit });
    return apiService.get(`/departments/search${query}`);
  },

  /**
   * Get department statistics
   * GET /departments/stats
   */
  getDepartmentStats: async () => {
    return apiService.get(`/departments/stats`);
  },

  /**
   * Get department by ID
   * GET /departments/:id
   */
  getDepartmentById: async (id: string) => {
    return apiService.get(`/departments/${id}`);
  },

  /**
   * Get department hierarchy
   * GET /departments/:id/hierarchy
   */
  getDepartmentHierarchy: async (id: string) => {
    return apiService.get(`/departments/${id}/hierarchy`);
  },

  /**
   * Update department
   * PATCH /departments/:id
   */
  updateDepartment: async (id: string, data: any) => {
    return apiService.patch(`/departments/${id}`, data);
  },

  /**
   * Deactivate department
   * PATCH /departments/:id/deactivate
   */
  deactivateDepartment: async (id: string) => {
    return apiService.patch(`/departments/${id}/deactivate`, {});
  },

  /**
   * Reactivate department
   * PATCH /departments/:id/reactivate
   */
  reactivateDepartment: async (id: string) => {
    return apiService.patch(`/departments/${id}/reactivate`, {});
  },

  // =============================================
  // Position Management
  // =============================================

  /**
   * Create new position
   * POST /positions
   */
  createPosition: async (data: any) => {
    return apiService.post(`/positions`, data);
  },

  /**
   * Get all positions
   * GET /positions
   */
  getPositions: async () => {
    return apiService.get(`/positions`);
  },

  /**
   * Search positions (paginated)
   * GET /positions/search
   */
  searchPositions: async (q?: string, page?: number, limit?: number) => {
    const query = buildQueryString({ q, page, limit });
    return apiService.get(`/positions/search${query}`);
  },

  /**
   * Get position statistics
   * GET /positions/stats
   */
  getPositionStats: async () => {
    return apiService.get(`/positions/stats`);
  },

  /**
   * Get position by ID
   * GET /positions/:id
   */
  getPositionById: async (id: string) => {
    return apiService.get(`/positions/${id}`);
  },

  /**
   * Get subordinate positions
   * GET /positions/:id/subordinates
   */
  getPositionSubordinates: async (id: string) => {
    return apiService.get(`/positions/${id}/subordinates`);
  },

  /**
   * Update position
   * PATCH /positions/:id
   */
  updatePosition: async (id: string, data: any) => {
    return apiService.patch(`/positions/${id}`, data);
  },

  /**
   * Deactivate position
   * PATCH /positions/:id/deactivate
   */
  deactivatePosition: async (id: string) => {
    return apiService.patch(`/positions/${id}/deactivate`, {});
  },

  /**
   * Reactivate position
   * PATCH /positions/:id/reactivate
   */
  reactivatePosition: async (id: string) => {
    return apiService.patch(`/positions/${id}/reactivate`, {});
  },

  /**
   * Get position history
   * GET /positions/:id/history
   */
  getPositionHistory: async (id: string) => {
    return apiService.get(`/positions/${id}/history`);
  },

  /**
   * End position assignment
   * POST /positions/:id/end-assignment
   */
  endAssignment: async (positionId: string, data: any) => {
    return apiService.post(`/positions/${positionId}/end-assignment`, data);
  },

  // =============================================
  // Organization Chart
  // =============================================

  /**
   * Get organization chart
   * GET /org-chart
   */
  getOrgChart: async () => {
    return apiService.get(`/org-chart`);
  },
};

