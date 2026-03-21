'use client';

import React from 'react';
import { LOAN_STATUS_CONFIG } from '@/lib/constants';
import type { LoanStatus } from '@/types/loan';
import { cn } from '@/lib/utils';

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = LOAN_STATUS_CONFIG[status];
  return (
    <span
      aria-label={`Loan status: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        config.bg,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
