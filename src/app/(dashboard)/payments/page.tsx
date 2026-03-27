'use client';

import React, { useState } from 'react';
import { DollarSign, CreditCard, CheckCircle2, XCircle, Search, X } from 'lucide-react';
import { usePayments, useCancelPayment } from '@/hooks/usePayments';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ClientSearch } from '@/components/shared/ClientSearch';
import { PaymentMethod, PaymentStatus, PAYMENT_STATUS_CONFIG } from '@/types/payment';
import { formatCurrency } from '@/lib/formatters';
import type { LoanPayment } from '@/types/payment';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_SIZE_LIST, DEBOUNCE_DELAY, DEFAULT_DATE_PRESET, NEXT_DAYS_RANGE } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

// ─── Date preset helpers ────────────────────────────────────────────────────

type DatePreset = 'today' | 'thisWeek' | 'thisMonth' | 'last30' | 'all' | 'custom';

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0] as string;
}

function getPresetDates(preset: DatePreset): { from: string; to: string } {
  const today = new Date();
  const todayStr = toDateStr(today);

  switch (preset) {
    case 'today':
      return { from: todayStr, to: todayStr };
    case 'thisWeek': {
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      return { from: toDateStr(monday), to: todayStr };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toDateStr(start), to: todayStr };
    }
    case 'last30': {
      const start = new Date(today);
      start.setDate(start.getDate() - NEXT_DAYS_RANGE);
      return { from: toDateStr(start), to: todayStr };
    }
    default:
      return { from: '', to: '' };
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────

// ─── Status & Method Badges ─────────────────────────────────────────────────

function StatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  const cfg = PAYMENT_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.color, cfg.bg)}>
      {label}
    </span>
  );
}

function MethodBadge({ method, label }: { method: PaymentMethod; label: string }) {
  const cfg = PAYMENT_STATUS_CONFIG[method];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.color, cfg.bg)}>
      {label}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [clientId, setClientId] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>(DEFAULT_DATE_PRESET);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [refSearch, setRefSearch] = useState('');
  const debouncedRefSearch = useDebounce(refSearch, DEBOUNCE_DELAY);

  const cancelPayment = useCancelPayment();

  const { from, to } = getPresetDates(datePreset);
  const paymentDateFrom = datePreset === 'custom' ? customFrom : from;
  const paymentDateTo = datePreset === 'custom' ? customTo : to;

  const { data, isLoading } = usePayments({
    page,
    limit: PAGE_SIZE_LIST,
    sortBy: 'paymentDate',
    sortOrder: 'DESC',
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    clientId: clientId || undefined,
    paymentDateFrom: paymentDateFrom || undefined,
    paymentDateTo: paymentDateTo || undefined,
    search: debouncedRefSearch || undefined,
  });

  const payments = data?.data ?? [];

  // Stats from current filtered results
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedCount = payments.filter((p) => p.status === PaymentStatus.Completed).length;
  const failedOrCancelled = payments.filter(
    (p) => p.status === PaymentStatus.Failed || p.status === PaymentStatus.Cancelled,
  ).length;

  function handlePresetChange(preset: DatePreset) {
    setDatePreset(preset);
    setPage(1);
  }

  function clearAllFilters() {
    setStatus('');
    setPaymentMethod('');
    setClientId('');
    setClientLabel('');
    setDatePreset('thisMonth');
    setCustomFrom('');
    setCustomTo('');
    setRefSearch('');
    setPage(1);
  }

  const hasActiveFilters = Boolean(
    clientId || datePreset !== 'thisMonth' || status || paymentMethod || refSearch,
  );

  const DATE_PRESETS: { label: string; value: DatePreset }[] = [
    { label: t('pages.payments.today'), value: 'today' },
    { label: t('pages.payments.thisWeek'), value: 'thisWeek' },
    { label: t('pages.payments.thisMonth'), value: 'thisMonth' },
    { label: `${t('pages.payments.lastDays')} ${NEXT_DAYS_RANGE}`, value: 'last30' },
    { label: t('pages.payments.allTime'), value: 'all' },
    { label: t('pages.payments.customRange'), value: 'custom' },
  ];

  const STATUS_TABS: { label: string; value: PaymentStatus | '' }[] = [
    { label: t('status.allStatuses'), value: '' },
    { label: t('status.completed'), value: PaymentStatus.Completed },
    { label: t('status.pending'), value: PaymentStatus.Pending },
    { label: t('status.failed'), value: PaymentStatus.Failed },
    { label: t('status.cancelled'), value: PaymentStatus.Cancelled },
  ];

  const METHOD_PILLS: { label: string; value: PaymentMethod | '' }[] = [
    { label: t('status.allMethods'), value: '' },
    { label: t('method.cash'), value: PaymentMethod.Cash },
    { label: t('method.bankTransfer'), value: PaymentMethod.BankTransfer },
    { label: t('method.creditCard'), value: PaymentMethod.CreditCard },
    { label: t('method.check'), value: PaymentMethod.Check },
  ];

  const columns = [
    {
      key: 'paymentDate',
      header: t('pages.payments.date'),
      render: (_: unknown, row: LoanPayment) => <DateDisplay value={row.paymentDate} />,
    },
    {
      key: 'client',
      header: t('pages.payments.client'),
      render: (_: unknown, row: LoanPayment) => {
        const client = row.installment?.loan?.client;
        return client ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {client.firstName} {client.lastName}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'installmentNumber',
      header: t('pages.payments.installmentNumber'),
      render: (_: unknown, row: LoanPayment) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.installment?.installmentNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: t('pages.payments.amount'),
      render: (_: unknown, row: LoanPayment) => (
        <span className="font-semibold">
          <CurrencyDisplay value={row.amount} />
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('pages.payments.method'),
      render: (_: unknown, row: LoanPayment) => {
        const methodLabels: Record<PaymentMethod, string> = {
          cash: t('method.cash'),
          bank_transfer: t('method.bankTransfer'),
          credit_card: t('method.creditCard'),
          check: t('method.check'),
        };
        return <MethodBadge method={row.paymentMethod} label={methodLabels[row.paymentMethod]} />;
      },
    },
    {
      key: 'status',
      header: t('pages.payments.status'),
      render: (_: unknown, row: LoanPayment) => {
        const statusLabels: Record<PaymentStatus, string> = {
          pending: t('status.pending'),
          completed: t('status.completed'),
          failed: t('status.failed'),
          cancelled: t('status.cancelled'),
        };
        return <StatusBadge status={row.status} label={statusLabels[row.status]} />;
      },
    },
    {
      key: 'referenceNumber',
      header: t('pages.payments.reference'),
      render: (_: unknown, row: LoanPayment) =>
        row.referenceNumber ? (
          <span className="font-mono text-xs text-muted-foreground">{row.referenceNumber}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: LoanPayment) =>
        row.status === PaymentStatus.Completed || row.status === PaymentStatus.Pending ? (
          <button
            onClick={() => {
              if (confirm(t('pages.payments.cancelPaymentConfirm'))) {
                void cancelPayment.mutate({ id: row.id });
              }
            }}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            {t('actions.cancel')}
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <DollarSign className="h-5 w-5" />
            {t('pages.payments.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? t('common.loading') : `${data?.total ?? 0} ${t('pages.payments.results')}`}
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title={t('pages.payments.totalPayments')} value={data?.total ?? 0} icon={<CreditCard className="h-5 w-5" />} />
        <StatsCard title={t('pages.payments.periodTotal')} value={formatCurrency(totalAmount)} icon={<DollarSign className="h-5 w-5" />} />
        <StatsCard title={t('status.completed')} value={completedCount} icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} />
        <StatsCard title={t('pages.payments.failedCancelled')} value={failedOrCancelled} icon={<XCircle className="h-5 w-5 text-red-500" />} />
      </div>

      {/* ─── Filter panel ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {/* Date presets */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('pages.payments.paymentDate')}
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

        {/* Payment method pills */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('pages.payments.paymentMethod')}
          </p>
          <div className="flex flex-wrap gap-2">
            {METHOD_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => { setPaymentMethod(pill.value); setPage(1); }}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  paymentMethod === pill.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client + Reference search */}
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('pages.payments.client')}
            </p>
            <ClientSearch
              selectedId={clientId}
              selectedLabel={clientLabel}
              onSelect={(id, name) => { setClientId(id); setClientLabel(name); setPage(1); }}
              onClear={() => { setClientId(''); setClientLabel(''); setPage(1); }}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('pages.payments.referenceNotes')}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('pages.payments.searchReference')}
                value={refSearch}
                onChange={(e) => { setRefSearch(e.target.value); setPage(1); }}
                className="w-60 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {refSearch && (
                <button
                  type="button"
                  onClick={() => { setRefSearch(''); setPage(1); }}
                  className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('pages.payments.clearReferenceSearch')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex overflow-x-auto border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
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
        data={payments}
        isLoading={isLoading}
        emptyMessage={t('pages.payments.noPayments')}
      />

      {data && data.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}
    </div>
  );
}

