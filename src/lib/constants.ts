import type { LoanStatus, LoanType, LoanPurpose } from '@/types/loan';
import type { InstallmentStatus } from '@/types/installment';
import type { NotificationPriority, NotificationCategory } from '@/types/notification';

export const LOAN_STATUS_CONFIG: Record<
  LoanStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    dot: 'bg-yellow-500',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    dot: 'bg-blue-500',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-700',
    bg: 'bg-green-100',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bg: 'bg-red-100',
    dot: 'bg-red-500',
  },
  active: {
    label: 'Active',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    dot: 'bg-gray-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    dot: 'bg-gray-400',
  },
  defaulted: {
    label: 'Defaulted',
    color: 'text-red-900',
    bg: 'bg-red-200',
    dot: 'bg-red-800',
  },
  closed: {
    label: 'Closed',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    dot: 'bg-slate-500',
  },
};

export const INSTALLMENT_STATUS_CONFIG: Record<
  InstallmentStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100' },
  partial: { label: 'Partial', color: 'text-blue-700', bg: 'bg-blue-100' },
};

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  personal: 'Personal',
  auto: 'Auto',
  mortgage: 'Mortgage',
  business: 'Business',
  student: 'Student',
  credit_line: 'Credit Line',
};

export const LOAN_PURPOSE_LABELS: Record<LoanPurpose, string> = {
  home_purchase: 'Home Purchase',
  refinance: 'Refinance',
  home_improvement: 'Home Improvement',
  debt_consolidation: 'Debt Consolidation',
  auto_purchase: 'Auto Purchase',
  business_expansion: 'Business Expansion',
  equipment_purchase: 'Equipment Purchase',
  working_capital: 'Working Capital',
  education: 'Education',
  medical_expenses: 'Medical Expenses',
  vacation: 'Vacation',
  other: 'Other',
};

export const NOTIFICATION_PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; color: string; bg: string }
> = {
  low: { label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-100' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  payment_reminder: 'Payment Reminder',
  loan_approval: 'Loan Approval',
  loan_rejection: 'Loan Rejection',
  payment_received: 'Payment Received',
  overdue_payment: 'Overdue Payment',
  loan_completion: 'Loan Completion',
  system_alert: 'System Alert',
  promotional: 'Promotional',
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Loan Management';
