export enum NotificationType {
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  InApp = 'in_app',
}

export enum NotificationCategory {
  PaymentReminder = 'payment_reminder',
  LoanApproval = 'loan_approval',
  LoanRejection = 'loan_rejection',
  PaymentReceived = 'payment_received',
  OverduePayment = 'overdue_payment',
  LoanCompletion = 'loan_completion',
  SystemAlert = 'system_alert',
  Promotional = 'promotional',
}

export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export enum NotificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
  Read = 'read',
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  pending: number;
  delivered: number;
  failed: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface CreateNotificationDto {
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}
