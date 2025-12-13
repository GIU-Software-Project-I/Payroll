'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user?.role) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user?.role, router]);

  return null;
}

