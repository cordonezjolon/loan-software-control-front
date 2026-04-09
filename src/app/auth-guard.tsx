'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';

function getCookieToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('access_token='));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function getBrowserToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const localToken = localStorage.getItem('access_token');
  if (localToken && localToken !== 'undefined') {
    return localToken;
  }

  const cookieToken = getCookieToken();
  return cookieToken && cookieToken !== 'undefined' ? cookieToken : null;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hydrated = useAuthStore((state) => state._hydrated);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    const validateCurrentSession = async () => {
      const candidateToken = token && token !== 'undefined' ? token : getBrowserToken();

      if (!candidateToken) {
        clearAuth();
        if (!cancelled) {
          window.location.replace('/login');
        }
        return;
      }

      try {
        const validation = await authApi.validateToken(candidateToken);

        if (!validation.valid || !validation.user) {
          clearAuth();
          if (!cancelled) {
            window.location.replace('/login');
          }
          return;
        }

        if (token !== candidateToken || !user) {
          setAuth(candidateToken, validation.user);
        }
      } catch {
        clearAuth();
        if (!cancelled) {
          window.location.replace('/login');
        }
      }
    };

    void validateCurrentSession();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, user, setAuth, clearAuth]);

  return <>{children}</>;
}
