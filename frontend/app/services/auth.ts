import api from './api';

// Types matching backend DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
  };
  userType: 'employee' | 'candidate';
  expiresIn: string;
  access_token?: string; // Only in dev mode
}

export interface RegisterCandidateRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  nationalId: string;
  personalEmail: string;
  password: string;
  mobilePhone: string;
}

export interface RegisterCandidateResponse {
  message: string;
  candidateId: string;
}

export interface LogoutResponse {
  message: string;
}

// Auth API functions
export const authService = {
  /**
   * Login with email and password
   * Sets HTTP-only cookie with JWT token
   */
  async login(credentials: LoginRequest) {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response;
  },

  /**
   * Register a new candidate (public registration)
   */
  async registerCandidate(data: RegisterCandidateRequest) {
    const response = await api.post<RegisterCandidateResponse>('/auth/register-candidate', data);
    return response;
  },

  /**
   * Logout - clears the JWT cookie
   */
  async logout() {
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response;
  },

  /**
   * Get current user profile (if authenticated)
   */
  async getCurrentUser() {
    const response = await api.get<LoginResponse['user']>('/employee/profile/me');
    return response;
  },
};

export default authService;

