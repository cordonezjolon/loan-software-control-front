'use client';

import React, { useState } from 'react';
import { DollarSign, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PaymentMethod, PaymentStatus, PAYMENT_STATUS_CONFIG } from '@/types/payment';
import { formatCurrency } from '@/lib/formatters';
import type { LoanPayment } from '@/types/payment';
import { cn } from '@/lib/utils';

const METHOD_TABS: { label: string; value: PaymentMethod | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Cash', value: PaymentMethod.Cash },
  { label: 'Bank Transfer', value: PaymentMethod.BankTransfer },
  { label: 'Credit Card', value: PaymentMethod.CreditCard },
  { label: 'Check', value: PaymentMethod.Check },
];

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const cfg = PAYMENT_STATUS_CONFIG[method];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  );
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');

  const { data, isLoading } = usePayments({
    page,
    limit: 15,
    paymentMethod: paymentMethod || undefined,
  });

  const payments = data?.data ?? [];

  // Compute quick stats from current page data
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedCount = payments.filter((p) => p.status === PaymentStatus.Completed).length;
  const cancelledCount = payments.filter((p) => p.status === PaymentStatus.Cancelled).length;

  const columns = [
    {
      key: 'paymentDate',
      header: 'Date',
      render: (_: unknown, row: LoanPayment) => <DateDisplay value={row.paymentDate} />,
    },
    {
      key: 'installment',
      header: 'Installment #',
      render: (_: unknown, row: LoanPayment) => (
        <span className="font-mono text-muted-foreground">
          {row.installment?.installmentNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (_: unknown, row: LoanPayment) => {
        const client = row.installment?.loan?.client;
        return client ? (
          <span className="text-sm text-foreground">
            {client.firstName} {client.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_: unknown, row: LoanPayment) => (
        <span className="font-semibold">
          <CurrencyDisplay value={row.amount} />
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (_: unknown, row: LoanPayment) => <MethodBadge method={row.paymentMethod} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: unknown, row: LoanPayment) => <StatusBadge status={row.status} />,
    },
    {
      key: 'referenceNumber',
      header: 'Reference',
      render: (_: unknown, row: LoanPayment) =>
        row.referenceNumber ? (
          <span className="font-mono text-xs text-muted-foreground">{row.referenceNumber}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <DollarSign className="h-5 w-5" />
          Payments
        </h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} total payments</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Payments" value={data?.total ?? 0} icon={<CreditCard className="h-5 w-5" />} />
        <StatsCard title="Page Total" value={formatCurrency(totalAmount)} icon={<DollarSign className="h-5 w-5" />} />
        <StatsCard title="Completed" value={completedCount} icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} />
        <StatsCard title="Cancelled" value={cancelledCount} icon={<XCircle className="h-5 w-5 text-red-500" />} />
      </div>

      {/* Method filter tabs */}
      <div className="flex flex-wrap border-b border-border">
        {METHOD_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setPaymentMethod(tab.value); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              paymentMethod === tab.value
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
        emptyMessage="No payments recorded yet. Go to Installments to register a payment."
      />

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}
    </div>
  );
}

