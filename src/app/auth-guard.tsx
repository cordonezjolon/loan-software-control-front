'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/shared/LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state._hydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    const localToken = localStorage.getItem('access_token');
    if (!token && (!localToken || localToken === 'undefined')) {
      void router.replace('/login');
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return <PageLoader />;
  }

  if (!token) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
