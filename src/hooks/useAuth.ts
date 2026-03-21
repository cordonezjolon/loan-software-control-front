'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';
import type { LoginDto, RegisterDto } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const { token, user, setAuth, clearAuth, isAuthenticated, hasRole, hasAnyRole } = useAuthStore();

  const login = useCallback(
    async (dto: LoginDto) => {
      const response = await authApi.login(dto);
      setAuth(response.accessToken, response.user);
      router.push('/dashboard');
      return response;
    },
    [setAuth, router],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      const response = await authApi.register(dto);
      setAuth(response.accessToken, response.user);
      router.push('/dashboard');
      return response;
    },
    [setAuth, router],
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  return {
    token,
    user,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated(),
    hasRole,
    hasAnyRole,
  };
}
