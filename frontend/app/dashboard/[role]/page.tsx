'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';

// Role-specific dashboard components
const roleDashboards: Record<string, () => ReactNode> = {
  'department-employee': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Department Employee Dashboard</h1>
      <p className="text-slate-600">Welcome to your self-service employee portal</p>
    </div>
  ),
  'department-head': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Department Head Dashboard</h1>
      <p className="text-slate-600">Manage your team and approve requests</p>
    </div>
  ),
  'hr-manager': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">HR Manager Dashboard</h1>
      <p className="text-slate-600">Strategic HR management and oversight</p>
    </div>
  ),
  'hr-employee': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">HR Employee Dashboard</h1>
      <p className="text-slate-600">HR operations and execution</p>
    </div>
  ),
  'hr-admin': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">HR Admin Dashboard</h1>
      <p className="text-slate-600">HR system administration</p>
    </div>
  ),
  'payroll-specialist': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Payroll Specialist Dashboard</h1>
      <p className="text-slate-600">Payroll processing and configuration</p>
    </div>
  ),
  'payroll-manager': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Payroll Manager Dashboard</h1>
      <p className="text-slate-600">Payroll approval and oversight</p>
    </div>
  ),
  'system-admin': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">System Admin Dashboard</h1>
      <p className="text-slate-600">System-wide configuration and management</p>
    </div>
  ),
  'legal-policy-admin': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Legal & Policy Admin Dashboard</h1>
      <p className="text-slate-600">Legal rules and compliance management</p>
    </div>
  ),
  'recruiter': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
      <p className="text-slate-600">Recruitment and candidate management</p>
    </div>
  ),
  'finance-staff': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Finance Staff Dashboard</h1>
      <p className="text-slate-600">Payroll review and financial management</p>
    </div>
  ),
  'job-candidate': () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Job Candidate Portal</h1>
      <p className="text-slate-600">Track your applications and status</p>
    </div>
  ),
};

export default function RoleDashboardPage() {
  const params = useParams();
  const { user } = useAuth();
  const role = params?.role as string;

  // Get the dashboard component for this role
  const DashboardComponent = roleDashboards[role];

  if (!DashboardComponent) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">Unknown Role</h2>
        <p className="text-yellow-800">The dashboard for role '{role}' is not configured.</p>
      </div>
    );
  }

  return (
    <div>
      <DashboardComponent />

      {/* Quick Stats Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Items</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Active Tasks</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="text-3xl">✓</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">New Messages</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Last Updated</p>
              <p className="text-lg font-bold text-slate-900 mt-2">Today</p>
            </div>
            <div className="text-3xl">🕐</div>
          </div>
        </div>
      </div>
    </div>
  );
}

