'use client';

import React from 'react';
import { INSTALLMENT_STATUS_CONFIG } from '@/lib/constants';
import type { InstallmentStatus } from '@/types/installment';
import { cn } from '@/lib/utils';

interface InstallmentStatusBadgeProps {
  status: InstallmentStatus;
  className?: string;
}

export function InstallmentStatusBadge({ status, className }: InstallmentStatusBadgeProps) {
  const config = INSTALLMENT_STATUS_CONFIG[status];
  return (
    <span
      aria-label={`Installment status: ${config.label}`}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        config.bg,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
