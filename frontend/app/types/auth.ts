// =====================================================
// Authentication Interfaces
// =====================================================

import { SystemRole } from './enums';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: SystemRole;
  department?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}

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
  access_token?: string;
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

export interface RegisterEmployeeRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  nationalId: string;
  email: string;
  password: string;
  mobilePhone?: string;
  departmentId?: string;
  positionId?: string;
  role?: SystemRole;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

