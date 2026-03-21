'use client';

import React from 'react';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DateDisplayProps {
  value: string | Date;
  withTime?: boolean;
  className?: string;
}

export function DateDisplay({ value, withTime, className }: DateDisplayProps) {
  return (
    <span className={cn('whitespace-nowrap', className)}>
      {withTime ? formatDateTime(value) : formatDate(value)}
    </span>
  );
}
