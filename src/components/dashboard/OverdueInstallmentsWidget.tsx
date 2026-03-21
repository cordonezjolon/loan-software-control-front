'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useOverdueInstallments } from '@/hooks/useInstallments';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function OverdueInstallmentsWidget() {
  const { data: overdue, isLoading } = useOverdueInstallments();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-semibold text-foreground">Overdue Installments</h2>
        {overdue && overdue.length > 0 && (
          <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {overdue.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <LoadingSpinner size="sm" className="text-primary" />
        </div>
      ) : !overdue?.length ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No overdue installments
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {overdue.slice(0, 6).map((inst) => (
            <li key={inst.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <Link
                  href={`/installments`}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  Installment #{inst.installmentNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Due: <DateDisplay value={inst.dueDate} />
                </p>
              </div>
              <div className="text-right">
                <CurrencyDisplay
                  value={inst.totalAmount}
                  className="text-sm font-semibold text-destructive"
                />
                {inst.lateFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    +<CurrencyDisplay value={inst.lateFee} /> late fee
                  </p>
                )}
              </div>
            </li>
          ))}
          {overdue.length > 6 && (
            <li className="px-5 py-3 text-center">
              <Link href="/installments?status=overdue" className="text-xs text-primary hover:underline">
                View all {overdue.length} overdue
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
