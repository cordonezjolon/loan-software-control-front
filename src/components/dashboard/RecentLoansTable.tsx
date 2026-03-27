'use client';

import React from 'react';
import Link from 'next/link';
import { useLoans } from '@/hooks/useLoans';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { LOAN_TYPE_LABELS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function RecentLoansTable() {
  const { t } = useI18n();
  const { data, isLoading } = useLoans({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{t('pages.dashboard.recentLoans')}</h2>
        <Link href="/loans" className="text-xs font-medium text-primary hover:underline">
          {t('actions.viewAll')}
        </Link>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner size="md" className="text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {[t('pages.loans.client'), t('pages.loans.type'), t('pages.loans.principal'), t('pages.loans.status'), t('pages.loans.startDate')].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t border-border hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/loans/${loan.id}`} className="font-medium text-primary hover:underline">
                      {loan.client
                        ? `${loan.client.firstName} ${loan.client.lastName}`
                        : '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {LOAN_TYPE_LABELS[loan.loanType] ?? loan.loanType}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <CurrencyDisplay value={loan.principal} />
                  </td>
                  <td className="px-4 py-3">
                    <LoanStatusBadge status={loan.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <DateDisplay value={loan.startDate} />
                  </td>
                </tr>
              ))}
              {!data?.data.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t('pages.dashboard.noLoansYet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
