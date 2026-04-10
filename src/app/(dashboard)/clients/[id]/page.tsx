'use client';

import React from 'react';
import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { useClient } from '@/hooks/useClients';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { LoanStatus } from '@/types/loan';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const { data: client, isLoading } = useClient(id);

  if (isLoading) return <PageLoader />;
  if (!client) return <p className="text-muted-foreground">{t('pages.clients.clientNotFound')}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('pages.clientsNew.backToClients')}
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {client.firstName} {client.lastName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {client.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {client.phoneNumber}
              </span>
              {client.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.address.city}, {client.address.state}
                </span>
              )}
            </div>
          </div>
          <span
            className={
              client.isActive
                ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500'
            }
          >
            {client.isActive ? t('status.active') : t('status.inactive')}
          </span>
        </div>

        {/* Financial info */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border pt-5">
          {[
            { label: t('pages.clients.creditScore'), value: client.creditScore ?? '—', highlight: true },
            {
              label: t('pages.clients.monthlyIncome'),
              value: client.monthlyIncome ? <CurrencyDisplay value={client.monthlyIncome} /> : '—',
            },
            { label: t('pages.clientsNew.employmentYears'), value: client.employmentYears ?? '—' },
            {
              label: t('pages.clients.debtToIncome'),
              value: client.debtToIncomeRatio
                ? `${(client.debtToIncomeRatio * 100).toFixed(1)}%`
                : '—',
            },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={`mt-0.5 text-lg font-semibold ${
                  highlight && typeof value === 'number'
                    ? value >= 700
                      ? 'text-green-600'
                      : value >= 600
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    : 'text-foreground'
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Loans */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('pages.loans.title')} ({client.loans?.length ?? 0})
          </h2>
          <Link
            href={`/loans/new?clientId=${client.id}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            + {t('pages.loans.newLoan')}
          </Link>
        </div>

        {!client.loans?.length ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">{t('pages.dashboard.noLoansYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    t('pages.loans.type'),
                    t('pages.loans.principal'),
                    t('pages.loans.rate'),
                    t('pages.loans.term'),
                    t('pages.loans.status'),
                    t('pages.loans.startDate'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {client.loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <Link href={`/loans/${loan.id}`} className="font-medium text-primary hover:underline">
                        {t(`loanTypes.${loan.loanType}`)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <CurrencyDisplay value={loan.principal} />
                    </td>
                    <td className="px-5 py-3">{(loan.interestRate * 100).toFixed(2)}%</td>
                    <td className="px-5 py-3">{loan.termInMonths} {t('pages.loans.months')}</td>
                    <td className="px-5 py-3">
                      <LoanStatusBadge status={loan.status as LoanStatus} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <DateDisplay value={loan.startDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {client.notes && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t('pages.loans.notes')}</p>
          <p className="text-sm text-foreground">{client.notes}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {t('pages.loans.createdAt')}: <DateDisplay value={client.createdAt} withTime />
        {' · '}
        {t('pages.loans.updatedAt')}: <DateDisplay value={client.updatedAt} withTime />
      </div>
    </div>
  );
}
