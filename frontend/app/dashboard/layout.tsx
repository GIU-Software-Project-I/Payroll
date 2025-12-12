'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, ROLE_PERMISSIONS } from '@/app/context/AuthContext';
import { Sidebar, DashboardHeader } from '@/app/components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading, hasRole, getDefaultRoute } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role-based access for current path
    const matchingRoute = Object.keys(ROLE_PERMISSIONS)
      .filter(route => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0]; // Get most specific match

    if (matchingRoute) {
      const allowedRoles = ROLE_PERMISSIONS[matchingRoute];
      if (!hasRole(allowedRoles)) {
        console.warn(`[Dashboard] Access denied for role ${user?.role} to ${pathname}`);
        // Redirect to user's default route
        router.push(getDefaultRoute());
      }
    }
  }, [isAuthenticated, isLoading, pathname, hasRole, user, router, getDefaultRoute]);

  // Loading state
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

  // Not authenticated - show redirect message
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

  // Check access for rendering
  const matchingRoute = Object.keys(ROLE_PERMISSIONS)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingRoute && !hasRole(ROLE_PERMISSIONS[matchingRoute])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="mt-2 text-slate-600">You don&apos;t have permission to view this page.</p>
          <p className="mt-1 text-sm text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
