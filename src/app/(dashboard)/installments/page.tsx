'use client';

import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { useInstallments, useInstallmentStatistics } from '@/hooks/useInstallments';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { InstallmentStatusBadge } from '@/components/installments/InstallmentStatusBadge';
import { RegisterPaymentModal } from '@/components/installments/RegisterPaymentModal';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { InstallmentStatus } from '@/types/installment';
import type { LoanInstallment } from '@/types/installment';
import { formatCurrency } from '@/lib/formatters';

const STATUS_TABS: { label: string; value: InstallmentStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: InstallmentStatus.Pending },
  { label: 'Overdue', value: InstallmentStatus.Overdue },
  { label: 'Paid', value: InstallmentStatus.Paid },
  { label: 'Partial', value: InstallmentStatus.Partial },
];

export default function InstallmentsPage() {
  const [status, setStatus] = useState<InstallmentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [payingInstallment, setPayingInstallment] = useState<LoanInstallment | null>(null);
  const { data: stats } = useInstallmentStatistics();

  const { data, isLoading } = useInstallments({
    status: status || undefined,
    page,
    limit: 15,
    sortBy: 'dueDate',
    sortOrder: 'ASC',
  });

  const columns = [
    {
      key: 'installmentNumber',
      header: '#',
      render: (_: unknown, row: LoanInstallment) => (
        <span className="font-mono text-muted-foreground">{row.installmentNumber}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (_: unknown, row: LoanInstallment) => <DateDisplay value={row.dueDate} />,
    },
    {
      key: 'principalAmount',
      header: 'Principal',
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.principalAmount} />,
    },
    {
      key: 'interestAmount',
      header: 'Interest',
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.interestAmount} />,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (_: unknown, row: LoanInstallment) => (
        <span className="font-semibold">
          <CurrencyDisplay value={row.totalAmount} />
        </span>
      ),
    },
    {
      key: 'lateFee',
      header: 'Late Fee',
      render: (_: unknown, row: LoanInstallment) =>
        row.lateFee > 0 ? (
          <CurrencyDisplay value={row.lateFee} className="text-destructive" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'remainingBalance',
      header: 'Remaining',
      render: (_: unknown, row: LoanInstallment) => <CurrencyDisplay value={row.remainingBalance} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: unknown, row: LoanInstallment) => <InstallmentStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: LoanInstallment) =>
        row.status !== InstallmentStatus.Paid ? (
          <button
            onClick={() => setPayingInstallment(row)}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Pay
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Paid</span>
        ),
    },
  ];

  const overdueCount = stats?.overdueInstallments ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Installments</h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} total installments</p>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              {overdueCount} overdue installment{overdueCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Total overdue: {stats ? formatCurrency(stats.overdueAmount) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard
            title="Total Installments"
            value={stats.totalInstallments}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatsCard
            title="Paid"
            value={stats.paidInstallments}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueInstallments}
            subtitle={formatCurrency(stats.overdueAmount)}
          />
          <StatsCard
            title="Total Late Fees"
            value={formatCurrency(stats.totalLateFees)}
          />
        </div>
      )}

      {/* Tab filter */}
      <div className="flex border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
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
        emptyMessage="No installments found."
      />

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}

      {payingInstallment && (
        <RegisterPaymentModal
          installment={payingInstallment}
          open={Boolean(payingInstallment)}
          onClose={() => setPayingInstallment(null)}
        />
      )}
    </div>
  );
}
