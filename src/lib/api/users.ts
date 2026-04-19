import { api } from './client';
import { PaginatedResponse } from '@/types/api';
import { User, UserRole, UserStatus, UserProfile, CreateUserPayload, UpdateUserPayload } from '@/types/user';

export const userApi = {
  // Profile endpoints (public/authenticated)
  getProfile: () =>
    api.get<UserProfile>('/users/profile'),

  updateProfile: (dto: UpdateUserPayload) =>
    api.patch<UserProfile>('/users/profile', dto),

  changePassword: (dto: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<void>('/users/change-password', dto),

  // Admin endpoints: User management
  listUsers: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      role?: UserRole;
      status?: UserStatus;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ) =>
    api.get<{
      data: User[];
      total: number;
      page: number;
      limit: number;
    }>('/users', {
      params: {
        page,
        limit,
        ...filters,
      },
    }),

  getUser: (id: string) =>
    api.get<UserProfile>(`/users/${id}`),

  createUser: (dto: CreateUserPayload) =>
    api.post<UserProfile>('/users', dto),

  updateUser: (id: string, dto: UpdateUserPayload) =>
    api.patch<UserProfile>(`/users/${id}`, dto),

  deleteUser: (id: string) =>
    api.delete<void>(`/users/${id}`),

  restoreUser: (id: string) =>
    api.post<UserProfile>(`/users/${id}/restore`),

  activateUser: (id: string) =>
    api.post<UserProfile>(`/users/${id}/activate`),

  deactivateUser: (id: string) =>
    api.post<UserProfile>(`/users/${id}/deactivate`),

  suspendUser: (id: string) =>
    api.post<UserProfile>(`/users/${id}/suspend`),
};
