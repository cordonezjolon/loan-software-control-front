'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/shared/LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Read directly from localStorage — always synchronous, no race with Zustand hydration.
    // 'access_token' is set by setAuth alongside the Zustand persisted state.
    const localToken = localStorage.getItem('access_token');
    if (!localToken || localToken === 'undefined') {
      void router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  // React to Zustand logout (token cleared) after the initial check
  useEffect(() => {
    if (checked && !token) {
      const localToken = localStorage.getItem('access_token');
      if (!localToken || localToken === 'undefined') {
        void router.replace('/login');
      }
    }
  }, [checked, token, router]);

  if (!checked) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
