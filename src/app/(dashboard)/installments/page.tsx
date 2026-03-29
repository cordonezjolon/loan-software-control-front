'use client';

import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Calendar, X } from 'lucide-react';
import { useInstallments, useInstallmentStatistics } from '@/hooks/useInstallments';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { InstallmentStatusBadge } from '@/components/installments/InstallmentStatusBadge';
import { RegisterPaymentModal } from '@/components/installments/RegisterPaymentModal';
import { RegisterAdvancePaymentModal } from '@/components/installments/RegisterAdvancePaymentModal';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ClientSearch } from '@/components/shared/ClientSearch';
import { InstallmentStatus } from '@/types/installment';
import type { LoanInstallment } from '@/types/installment';
import { formatCurrency } from '@/lib/formatters';
import { PAGE_SIZE_LIST, DEFAULT_DATE_PRESET, NEXT_DAYS_RANGE } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

// ─── Date preset helpers ────────────────────────────────────────────────────

type DatePreset = 'overdue' | 'thisWeek' | 'thisMonth' | 'next30' | 'all' | 'custom';

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0] as string;
}

function getPresetDates(preset: DatePreset): {
  from: string;
  to: string;
  overdueOnly: boolean;
} {
  const today = new Date();
  const todayStr = toDateStr(today);

  switch (preset) {
    case 'overdue':
      return { from: '', to: '', overdueOnly: true };
    case 'thisWeek': {
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      return { from: todayStr, to: toDateStr(end), overdueOnly: false };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: toDateStr(start), to: toDateStr(end), overdueOnly: false };
    }
    case 'next30': {
      const end = new Date(today);
      end.setDate(end.getDate() + NEXT_DAYS_RANGE);
      return { from: todayStr, to: toDateStr(end), overdueOnly: false };
    }
    default:
      return { from: '', to: '', overdueOnly: false };
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InstallmentsPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<InstallmentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [payingInstallment, setPayingInstallment] = useState<LoanInstallment | null>(null);
  const [advancePaymentInstallment, setAdvancePaymentInstallment] = useState<LoanInstallment | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>(DEFAULT_DATE_PRESET);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { data: stats } = useInstallmentStatistics();

  const { from, to, overdueOnly } = getPresetDates(datePreset);
  const dueDateFrom = datePreset === 'custom' ? customFrom : from;
  const dueDateTo = datePreset === 'custom' ? customTo : to;

  const { data, isLoading } = useInstallments({
    status: status || undefined,
    clientId: clientId || undefined,
    dueDateFrom: dueDateFrom || undefined,
    dueDateTo: dueDateTo || undefined,
    overdueOnly: overdueOnly || undefined,
    page,
    limit: PAGE_SIZE_LIST,
    sortBy: 'dueDate',
    sortOrder: 'ASC',
  });

  function handlePresetChange(preset: DatePreset) {
    setDatePreset(preset);
    setPage(1);
  }

  function handleStatusChange(s: InstallmentStatus | '') {
    setStatus(s);
    setPage(1);
  }

  function clearAllFilters() {
    setStatus('');
    setClientId('');
    setClientLabel('');
    setDatePreset('thisMonth');
    setCustomFrom('');
    setCustomTo('');
    setPage(1);
  }

  const overdueCount = stats?.overdueInstallments ?? 0;
  const hasActiveFilters = Boolean(clientId || datePreset !== 'thisMonth' || status);

  const STATUS_TABS: { label: string; value: InstallmentStatus | '' }[] = [
    { label: t('status.allStatuses'), value: '' },
    { label: t('status.pending'), value: InstallmentStatus.Pending },
    { label: t('status.overdue'), value: InstallmentStatus.Overdue },
    { label: t('status.paid'), value: InstallmentStatus.Paid },
    { label: t('status.partial'), value: InstallmentStatus.Partial },
  ];

  const DATE_PRESETS: { label: string; value: DatePreset }[] = [
    { label: `⚠ ${t('status.overdue')}`, value: 'overdue' },
    { label: t('pages.installments.thisWeek'), value: 'thisWeek' },
    { label: t('pages.installments.thisMonth'), value: 'thisMonth' },
    { label: `${t('pages.installments.nextDays')} ${NEXT_DAYS_RANGE}`, value: 'next30' },
    { label: t('pages.installments.allTime'), value: 'all' },
    { label: t('pages.installments.customRange'), value: 'custom' },
  ];

  const columns = [
    {
      key: 'client',
      header: t('pages.installments.client'),
      render: (_: unknown, row: LoanInstallment) => {
        const client = row.loan?.client;
        if (!client) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {client.firstName} {client.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{client.email}</p>
          </div>
        );
      },
    },
    {
      key: 'installmentNumber',
      header: '#',
      render: (_: unknown, row: LoanInstallment) => (
        <span className="font-mono text-sm text-muted-foreground">{row.installmentNumber}</span>
      ),
    },
    {
      key: 'dueDate',
      header: t('pages.installments.dueDateCol'),
      render: (_: unknown, row: LoanInstallment) => <DateDisplay value={row.dueDate} />,
    },
    {
      key: 'principalAmount',
      header: t('pages.installments.principal'),
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.principalAmount} />,
    },
    {
      key: 'interestAmount',
      header: t('pages.installments.interest'),
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.interestAmount} />,
    },
    {
      key: 'totalAmount',
      header: t('pages.installments.total'),
      render: (_: unknown, row: LoanInstallment) => (
        <span className="font-semibold">
          <CurrencyDisplay value={row.totalAmount} />
        </span>
      ),
    },
    {
      key: 'lateFee',
      header: t('pages.installments.lateFee'),
      render: (_: unknown, row: LoanInstallment) =>
        row.lateFee > 0 ? (
          <CurrencyDisplay value={row.lateFee} className="text-destructive" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'remainingBalance',
      header: t('pages.installments.remaining'),
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.remainingBalance} />,
    },
    {
      key: 'status',
      header: t('pages.loans.status'),
      render: (_: unknown, row: LoanInstallment) => <InstallmentStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: LoanInstallment) =>
        row.status !== InstallmentStatus.Paid ? (
          <div className="flex gap-2">
            <button
              onClick={() => setPayingInstallment(row)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('actions.pay')}
            </button>
            {row.loan?.id && (
              <button
                onClick={() => setAdvancePaymentInstallment(row)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
              >
                {t('actions.advancePay')}
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t('status.paid')}</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('pages.installments.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? t('common.loading') : `${data?.total ?? 0} ${t('pages.installments.results')}`}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      {/* Overdue alert banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {overdueCount} {t('pages.installments.overdueInstallments')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('pages.installments.totalOverdue')}: {stats ? formatCurrency(stats.overdueAmount) : '—'}
            </p>
          </div>
          <button
            onClick={() => { handlePresetChange('overdue'); handleStatusChange(''); }}
            className="shrink-0 rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            {t('pages.installments.viewOverdue')}
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard
            title={t('pages.installments.totalInstallments')}
            value={stats.totalInstallments}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatsCard
            title={t('status.paid')}
            value={stats.paidInstallments}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title={t('status.overdue')}
            value={stats.overdueInstallments}
            subtitle={formatCurrency(stats.overdueAmount)}
          />
          <StatsCard title={t('pages.installments.totalLateFees')} value={formatCurrency(stats.totalLateFees)} />
        </div>
      )}

      {/* ─── Filter panel ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Row 1: Date presets */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('pages.installments.dueDate')}
          </p>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  datePreset === preset.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom date range inputs */}
          {datePreset === 'custom' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                aria-label={t('common.fromDate')}
              />
              <span className="text-xs text-muted-foreground">{t('common.to')}</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                aria-label={t('common.toDate')}
              />
            </div>
          )}
        </div>

        {/* Row 2: Client filter */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('pages.installments.client')}
          </p>
          <ClientSearch
            selectedId={clientId}
            selectedLabel={clientLabel}
            onSelect={(id, name) => { setClientId(id); setClientLabel(name); setPage(1); }}
            onClear={() => { setClientId(''); setClientLabel(''); setPage(1); }}
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage={t('pages.installments.noInstallments')}
      />

      {data && data.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}

      {payingInstallment && (
        <RegisterPaymentModal
          installment={payingInstallment}
          open={Boolean(payingInstallment)}
          onClose={() => setPayingInstallment(null)}
        />
      )}

      {advancePaymentInstallment && (
        <RegisterAdvancePaymentModal
          installment={advancePaymentInstallment}
          open={Boolean(advancePaymentInstallment)}
          onClose={() => setAdvancePaymentInstallment(null)}
        />
      )}
    </div>
  );
}
