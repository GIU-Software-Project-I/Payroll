// Constants for the HR System
import { SystemRole } from '@/app/types';

export const APP_NAME = 'HR System';
export const APP_DESCRIPTION = 'German International University HR Management System';

export const NAV_LINKS = {
  public: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  auth: [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
  ],
};

export const DASHBOARD_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'home',
  },
  {
    label: 'Employee Profile',
    href: '/dashboard/employee',
    icon: 'user',
  },
  {
    label: 'Organization',
    href: '/dashboard/organization',
    icon: 'building',
  },
  {
    label: 'Recruitment',
    href: '/dashboard/recruitment',
    icon: 'users',
  },
  {
    label: 'Onboarding',
    href: '/dashboard/onboarding',
    icon: 'clipboard-check',
  },
  {
    label: 'Time Management',
    href: '/dashboard/time-management',
    icon: 'clock',
  },
  {
    label: 'Leaves',
    href: '/dashboard/leaves',
    icon: 'calendar',
  },
  {
    label: 'Payroll',
    href: '/dashboard/payroll',
    icon: 'dollar-sign',
  },
  {
    label: 'Performance',
    href: '/dashboard/performance',
    icon: 'trending-up',
  },
  {
    label: 'Offboarding',
    href: '/dashboard/offboarding',
    icon: 'log-out',
  },
];

export const MOCK_USER = {
  id: '1',
  firstName: 'Ahmed',
  lastName: 'Hassan',
  email: 'ahmed.hassan@giu.edu.eg',
  role: SystemRole.HR_MANAGER,
  department: 'Human Resources',
  avatar: undefined,
};

export const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Leave Request Approved',
    message: 'Your annual leave request for Dec 20-25 has been approved.',
    read: false,
    createdAt: '2025-12-11T09:00:00Z',
  },
  {
    id: '2',
    type: 'info' as const,
    title: 'Payroll Processing',
    message: 'December payroll is now under review.',
    read: false,
    createdAt: '2025-12-10T14:30:00Z',
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Performance Review Due',
    message: 'You have 3 pending performance reviews to complete.',
    read: true,
    createdAt: '2025-12-09T11:00:00Z',
  },
  {
    id: '4',
    type: 'success' as const,
    title: 'New Employee Onboarded',
    message: 'Sarah Ahmed has successfully completed onboarding.',
    read: true,
    createdAt: '2025-12-08T16:00:00Z',
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalEmployees: 248,
  activeLeaves: 12,
  pendingApprovals: 8,
  openPositions: 5,
  pendingPayroll: 3,
  performanceReviews: 15,
};

