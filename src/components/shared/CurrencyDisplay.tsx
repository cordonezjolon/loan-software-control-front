'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  className?: string;
  colored?: boolean;
}

export function CurrencyDisplay({ value, currency, className, colored }: CurrencyDisplayProps) {
  return (
    <span
      className={cn(
        colored && value > 0 && 'text-green-600',
        colored && value < 0 && 'text-red-600',
        className,
      )}
    >
      {formatCurrency(value, currency)}
    </span>
  );
}
