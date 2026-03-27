'use client';

import React from 'react';
import { LOAN_STATUS_CONFIG } from '@/lib/constants';
import type { LoanStatus } from '@/types/loan';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const { t } = useI18n();
  const config = LOAN_STATUS_CONFIG[status];

  const labelByStatus: Record<LoanStatus, string> = {
    pending: t('status.pending'),
    under_review: t('status.underReview'),
    approved: t('status.approved'),
    rejected: t('status.rejected'),
    active: t('status.active'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
    defaulted: t('status.defaulted'),
    closed: t('status.closed'),
  };

  const localizedLabel = labelByStatus[status] ?? config.label;
  return (
    <span
      aria-label={`${t('pages.loans.status')}: ${localizedLabel}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        config.bg,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {localizedLabel}
    </span>
  );
}
