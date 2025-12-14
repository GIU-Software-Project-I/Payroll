'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { SystemRole } from '@/app/types';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { hasRole } = useAuth();

  useEffect(() => {
    // Redirect to appropriate dashboard after 3 seconds
    const timer = setTimeout(() => {
      // Check user role and redirect to appropriate dashboard
      if (hasRole([SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN])) {
        router.push('/dashboard/hr-admin');
      } else if (hasRole([SystemRole.HR_MANAGER])) {
        router.push('/dashboard/hr-manager');
      } else if (hasRole([SystemRole.HR_EMPLOYEE])) {
        router.push('/dashboard/hr-employee');
      } else if (hasRole([SystemRole.PAYROLL_MANAGER])) {
        router.push('/dashboard/payroll-manager');
      } else if (hasRole([SystemRole.PAYROLL_SPECIALIST])) {
        router.push('/dashboard/payroll-specialist');
      } else if (hasRole([SystemRole.DEPARTMENT_HEAD])) {
        router.push('/dashboard/department-head');
      } else if (hasRole([SystemRole.DEPARTMENT_EMPLOYEE])) {
        router.push('/dashboard/department-employee');
      } else if (hasRole([SystemRole.RECRUITER])) {
        router.push('/dashboard/recruiter');
      } else if (hasRole([SystemRole.JOB_CANDIDATE])) {
        router.push('/dashboard/job-candidate');
      } else if (hasRole([SystemRole.LEGAL_POLICY_ADMIN])) {
        router.push('/dashboard/legal-policy-admin');
      } else {
        router.push('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasRole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You don't have permission to access this page. This area requires Finance Staff, Payroll Manager, or HR Admin privileges.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
          <p className="text-sm text-slate-500">
            Redirecting to your dashboard in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
