import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/users';
import { User, UserProfile, CreateUserPayload, UpdateUserPayload, ChangePasswordPayload, UserRole, UserStatus } from '@/types/user';
import { useToast } from '@/hooks/useToast';

export const USER_QUERY_KEY = 'users';

// ==================== Profile Queries ====================

export function useUserProfile() {
  return useQuery({
    queryKey: [USER_QUERY_KEY, 'profile'],
    queryFn: () => userApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: UpdateUserPayload) => userApi.updateProfile(dto),
    onSuccess: (data) => {
      queryClient.setQueryData([USER_QUERY_KEY, 'profile'], data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: ChangePasswordPayload) => userApi.changePassword(dto),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
}

// ==================== Admin Queries ====================

export function useUsers(
  page: number = 1,
  limit: number = 10,
  filters?: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  },
) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, 'list', { page, limit, ...filters }],
    queryFn: () => userApi.listUsers(page, limit, filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => userApi.getUser(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateUserPayload) => userApi.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: UpdateUserPayload) => userApi.updateUser(id, dto),
    onSuccess: (data) => {
      queryClient.setQueryData([USER_QUERY_KEY, id], data);
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      toast({
        title: 'Success',
        description: 'User restored successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restore user',
        variant: 'destructive',
      });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'User activated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate user',
        variant: 'destructive',
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userApi.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'User suspended successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend user',
        variant: 'destructive',
      });
    },
  });
}
