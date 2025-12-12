'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, ROLE_PERMISSIONS } from '@/app/context/AuthContext';
import { SystemRole } from '@/app/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: SystemRole[];
  fallbackRoute?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackRoute = '/dashboard'
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role permissions
    let hasAccess = false;

    if (allowedRoles) {
      // Use explicitly provided roles
      hasAccess = hasRole(allowedRoles);
    } else {
      // Check against ROLE_PERMISSIONS based on current path
      const matchingRoute = Object.keys(ROLE_PERMISSIONS)
        .filter(route => pathname.startsWith(route))
        .sort((a, b) => b.length - a.length)[0]; // Get most specific match

      if (matchingRoute) {
        hasAccess = hasRole(ROLE_PERMISSIONS[matchingRoute]);
      } else {
        // If no specific permission defined, allow access (main dashboard)
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      console.warn(`[RoleGuard] Access denied for role ${user?.role} to ${pathname}`);
      router.push(fallbackRoute);
    }
  }, [isAuthenticated, isLoading, user, hasRole, allowedRoles, pathname, router, fallbackRoute]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check access
  let hasAccess = false;
  if (allowedRoles) {
    hasAccess = hasRole(allowedRoles);
  } else {
    const matchingRoute = Object.keys(ROLE_PERMISSIONS)
      .filter(route => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];

    if (matchingRoute) {
      hasAccess = hasRole(ROLE_PERMISSIONS[matchingRoute]);
    } else {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="mt-2 text-slate-600">You don&apos;t have permission to access this page.</p>
          <p className="mt-1 text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

