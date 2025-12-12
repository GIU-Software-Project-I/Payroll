'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Notification, SystemRole } from '@/app/types';
import { MOCK_NOTIFICATIONS } from '@/app/constants';
import { authService, LoginResponse } from '@/app/services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  hasRole: (roles: SystemRole | SystemRole[]) => boolean;
  getDefaultRoute: () => string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  password: string;
  mobilePhone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend role to SystemRole enum
function mapRole(role: string): SystemRole {
  const roleMap: Record<string, SystemRole> = {
    'department employee': SystemRole.DEPARTMENT_EMPLOYEE,
    'department head': SystemRole.DEPARTMENT_HEAD,
    'HR Manager': SystemRole.HR_MANAGER,
    'HR Employee': SystemRole.HR_EMPLOYEE,
    'Payroll Specialist': SystemRole.PAYROLL_SPECIALIST,
    'Payroll Manager': SystemRole.PAYROLL_MANAGER,
    'System Admin': SystemRole.SYSTEM_ADMIN,
    'Legal & Policy Admin': SystemRole.LEGAL_POLICY_ADMIN,
    'Recruiter': SystemRole.RECRUITER,
    'Finance Staff': SystemRole.FINANCE_STAFF,
    'Job Candidate': SystemRole.JOB_CANDIDATE,
    'HR Admin': SystemRole.HR_ADMIN,
  };
  return roleMap[role] || SystemRole.DEPARTMENT_EMPLOYEE;
}

// Get default route based on user role
function getDefaultRouteForRole(role: SystemRole): string {
  switch (role) {
    // Admin roles - full dashboard access
    case SystemRole.SYSTEM_ADMIN:
    case SystemRole.HR_ADMIN:
      return '/dashboard';

    // HR roles - HR focused dashboard
    case SystemRole.HR_MANAGER:
    case SystemRole.HR_EMPLOYEE:
      return '/dashboard';

    // Payroll roles - payroll dashboard
    case SystemRole.PAYROLL_MANAGER:
    case SystemRole.PAYROLL_SPECIALIST:
      return '/dashboard/payroll';

    // Finance - payroll and reports
    case SystemRole.FINANCE_STAFF:
      return '/dashboard/payroll';

    // Recruiter - recruitment dashboard
    case SystemRole.RECRUITER:
      return '/dashboard/recruitment';

    // Department head - team management
    case SystemRole.DEPARTMENT_HEAD:
      return '/dashboard';

    // Job candidate - recruitment/application status
    case SystemRole.JOB_CANDIDATE:
      return '/dashboard/recruitment';

    // Regular employee - employee self-service
    case SystemRole.DEPARTMENT_EMPLOYEE:
    default:
      return '/dashboard';
  }
}

// Define which roles can access which routes
export const ROLE_PERMISSIONS: Record<string, SystemRole[]> = {
  // Admin routes - full access
  '/dashboard/admin': [SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN],

  // Organization structure
  '/dashboard/organization': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
  ],

  // Recruitment - HR, Recruiters, and Candidates (limited)
  '/dashboard/recruitment': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
    SystemRole.JOB_CANDIDATE,
  ],

  // Onboarding
  '/dashboard/onboarding': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
  ],

  // Offboarding
  '/dashboard/offboarding': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
  ],

  // Payroll - Payroll team and Finance
  '/dashboard/payroll': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.FINANCE_STAFF,
    SystemRole.DEPARTMENT_EMPLOYEE, // Can view own payslips
    SystemRole.DEPARTMENT_HEAD,
  ],

  // Performance - HR and Managers
  '/dashboard/performance': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE, // Can view own performance
  ],

  // Time Management - Everyone
  '/dashboard/time-management': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
  ],

  // Leaves - Everyone
  '/dashboard/leaves': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.RECRUITER,
  ],

  // Employee profile - Everyone
  '/dashboard/employee': [
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.RECRUITER,
  ],
};

// Transform backend user response to frontend User type
function transformUser(backendUser: LoginResponse['user']): User {
  return {
    id: backendUser.id,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    role: mapRole(backendUser.role),
    department: backendUser.department,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Check for stored session on mount
    const storedUser = localStorage.getItem('hr_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setNotifications(MOCK_NOTIFICATIONS);
      } catch {
        localStorage.removeItem('hr_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.error) {
        setError(response.error);
        return false;
      }

      if (response.data?.user) {
        const transformedUser = transformUser(response.data.user);
        setUser(transformedUser);
        setNotifications(MOCK_NOTIFICATIONS);
        localStorage.setItem('hr_user', JSON.stringify(transformedUser));
        return true;
      }

      setError('Invalid response from server');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.registerCandidate({
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        personalEmail: data.email,
        password: data.password,
        mobilePhone: data.mobilePhone,
      });

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setNotifications([]);
      localStorage.removeItem('hr_user');
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Check if user has one of the specified roles
  const hasRole = (roles: SystemRole | SystemRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Get the default route for the current user's role
  const getDefaultRoute = (): string => {
    if (!user) return '/login';
    return getDefaultRouteForRole(user.role);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        clearError,
        markNotificationRead,
        markAllNotificationsRead,
        hasRole,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
