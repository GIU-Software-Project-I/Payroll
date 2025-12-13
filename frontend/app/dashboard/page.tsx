'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // TODO: Re-enable authentication check
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    // TODO: Re-enable role-based redirect
    // if (user?.role) {
    //   router.push(`/dashboard/${user.role}`);
    // }
  }, [isAuthenticated, user?.role, router]);

  // TODO: Remove this when auth is re-enabled
  // Temporarily hardcode redirect for testing
  useEffect(() => {
    // Redirect to a default role for testing
    router.push('/dashboard/hr-admin');
  }, [router]);

  return null;
}
