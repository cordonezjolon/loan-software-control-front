import { api } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  CreateNotificationDto,
  Notification,
  NotificationCategory,
  NotificationPriority,
  NotificationStats,
  NotificationStatus,
  NotificationType,
} from '@/types/notification';

export interface NotificationsQuery extends PaginationParams {
  [key: string]: unknown;
  recipientId?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  findAll: (params?: NotificationsQuery): Promise<PaginatedResponse<Notification>> =>
    api.get<PaginatedResponse<Notification>>('/notifications', { params }),

  findOne: (id: string): Promise<Notification> =>
    api.get<Notification>(`/notifications/${id}`),

  create: (dto: CreateNotificationDto): Promise<Notification> =>
    api.post<Notification>('/notifications', dto),

  markAsRead: (id: string): Promise<Notification> =>
    api.patch<Notification>(`/notifications/${id}/read`),

  sendPaymentReminders: (daysAhead?: number): Promise<{ notificationsSent: number }> =>
    api.post<{ notificationsSent: number }>('/notifications/payment-reminders', undefined, {
      params: daysAhead !== undefined ? { daysAhead } : undefined,
    }),

  sendLoanApprovalNotification: (loanId: string): Promise<void> =>
    api.post<void>(`/notifications/loan-approval/${loanId}`),

  getStats: (): Promise<NotificationStats> =>
    api.get<NotificationStats>('/notifications/stats/summary'),
};
