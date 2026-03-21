'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationsQuery } from '@/lib/api/notifications';

export const NOTIFICATIONS_KEY = 'notifications';

export function useNotifications(params?: NotificationsQuery) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => notificationsApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'stats'],
    queryFn: () => notificationsApi.getStats(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
