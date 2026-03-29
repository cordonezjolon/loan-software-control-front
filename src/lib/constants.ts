import type { LoanStatus, LoanType, LoanPurpose, InterestCalculationMethod, PrepaymentAction } from '@/types/loan';
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

export const INTEREST_CALCULATION_METHOD_LABELS: Record<InterestCalculationMethod, string> = {
  flat_rate: 'Flat Rate (Add-On)',
  declining_balance: 'Declining Balance',
};

export const PREPAYMENT_ACTION_LABELS: Record<PrepaymentAction, string> = {
  reduce_term: 'Reduce Term (keep installment)',
  reduce_installment: 'Reduce Installment (keep term)',
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

/**
 * ISO 4217 currency code used throughout the app.
 * Change this to your local currency (e.g. 'EUR', 'GBP', 'COP', 'MXN', 'BRL').
 */
export const APP_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'USD';

/**
 * BCP 47 locale tag used for number / currency formatting.
 * Examples: 'es-CO' (Colombia), 'es-MX' (Mexico), 'pt-BR' (Brazil), 'en-GB' (UK).
 */
export const APP_LOCALE = process.env.NEXT_PUBLIC_LOCALE ?? 'en-US';

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Default page size for main list pages (loans, clients). */
export const PAGE_SIZE = 10;

/** Larger page size for detail-heavy list pages (installments, payments). */
export const PAGE_SIZE_LIST = 15;

// ─── Debounce delays (ms) ────────────────────────────────────────────────────

/** Standard search-input debounce used on loans and clients pages. */
export const DEBOUNCE_DELAY = 400;

/** Shorter debounce for the inline client autocomplete search. */
export const DEBOUNCE_CLIENT_SEARCH = 300;

// ─── TanStack Query cache times (ms) ─────────────────────────────────────────

/** Default staleTime for list/entity queries (30 seconds). */
export const QUERY_STALE_TIME = 30_000;

/** Longer staleTime for aggregated statistics queries (60 seconds). */
export const QUERY_STALE_TIME_STATS = 60_000;

/** Zero staleTime — always refetch (used for live calculations). */
export const QUERY_STALE_REALTIME = 0;

// ─── Credit Score Thresholds ─────────────────────────────────────────────────

/** Minimum score considered "Good" (green). */
export const CREDIT_SCORE_GOOD = 700;

/** Minimum score considered "Fair" (yellow). Scores below this are "Poor" (red). */
export const CREDIT_SCORE_FAIR = 600;

// ─── Date filter presets ──────────────────────────────────────────────────────

/** Default date preset applied when installments / payments pages first load. */
export const DEFAULT_DATE_PRESET = 'thisMonth' as const;

/** Number of days used by the "Next N days" installment and upcoming-payments filters. */
export const NEXT_DAYS_RANGE = 30;
