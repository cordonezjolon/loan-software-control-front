'use client';

import React from 'react';
import { INSTALLMENT_STATUS_CONFIG } from '@/lib/constants';
import type { InstallmentStatus } from '@/types/installment';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface InstallmentStatusBadgeProps {
  status: InstallmentStatus;
  className?: string;
}

export function InstallmentStatusBadge({ status, className }: InstallmentStatusBadgeProps) {
  const { t } = useI18n();
  const config = INSTALLMENT_STATUS_CONFIG[status];

  const labelByStatus: Record<InstallmentStatus, string> = {
    pending: t('status.pending'),
    paid: t('status.paid'),
    overdue: t('status.overdue'),
    partial: t('status.partial'),
  };

  const localizedLabel = labelByStatus[status] ?? config.label;
  return (
    <span
      aria-label={`${t('pages.installments.title')}: ${localizedLabel}`}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        config.bg,
        className,
      )}
    >
      {localizedLabel}
    </span>
  );
}
