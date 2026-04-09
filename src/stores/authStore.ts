'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, UserResponse } from '@/types/auth';

interface AuthStore {
  token: string | null;
  user: UserResponse | null;
  _hydrated: boolean;
  setAuth: (token: string, user: UserResponse) => void;
  restorePersistedAuth: () => boolean;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      _hydrated: false,
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          // Also set a cookie so the server-side proxy can detect auth
          document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
        }
        set({ token, user, _hydrated: true });
      },
      restorePersistedAuth: () => {
        if (typeof window === 'undefined') {
          return false;
        }

        const persistedToken = localStorage.getItem('access_token');
        const persistedStore = localStorage.getItem('auth-storage');

        let persistedUser: UserResponse | null = null;
        if (persistedStore) {
          try {
            const parsed = JSON.parse(persistedStore) as {
              state?: { user?: UserResponse | null; token?: string | null };
            };
            persistedUser = parsed.state?.user ?? null;
          } catch {
            persistedUser = null;
          }
        }

        const tokenToRestore =
          persistedToken && persistedToken !== 'undefined'
            ? persistedToken
            : (persistedStore
                ? (() => {
                    try {
                      const parsed = JSON.parse(persistedStore) as {
                        state?: { token?: string | null };
                      };
                      return parsed.state?.token ?? null;
                    } catch {
                      return null;
                    }
                  })()
                : null);

        if (!tokenToRestore || tokenToRestore === 'undefined') {
          return false;
        }

        document.cookie = `access_token=${tokenToRestore}; path=/; SameSite=Lax`;
        set({ token: tokenToRestore, user: persistedUser, _hydrated: true });
        return true;
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Expire the cookie
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
        set({ token: null, user: null });
      },
      isAuthenticated: () => Boolean(get().token && get().user),
      hasRole: (role) => get().user?.role === role,
      hasAnyRole: (roles) => {
        const userRole = get().user?.role;
        return userRole ? roles.includes(userRole) : false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useAuthStore.setState({ _hydrated: true });
        }
      },
    },
  ),
);
