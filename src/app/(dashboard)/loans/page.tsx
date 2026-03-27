'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useLoans, useApproveLoan, useRejectLoan, useActivateLoan, useDeleteLoan } from '@/hooks/useLoans';
import { DataTable } from '@/components/shared/DataTable';
import { ClientSearch } from '@/components/shared/ClientSearch';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { LOAN_TYPE_LABELS, LOAN_STATUS_CONFIG, PAGE_SIZE } from '@/lib/constants';
import { ApiError } from '@/lib/api/client';
import { LoanStatus } from '@/types/loan';
import type { Loan } from '@/types/loan';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function LoansPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const { data, isLoading } = useLoans({
    clientId: clientId || undefined,
    status: (status as LoanStatus) || undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const activateLoan = useActivateLoan();
  const deleteLoan = useDeleteLoan();

  const statusLabelMap: Record<string, string> = {
    pending: t('status.pending'),
    under_review: t('status.underReview'),
    approved: t('status.approved'),
    rejected: t('status.rejected'),
    active: t('status.active'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
    defaulted: t('status.defaulted'),
    closed: t('status.closed'),
  };

  const STATUS_OPTIONS = [
    { label: t('pages.loans.allStatuses'), value: '' },
    ...Object.entries(LOAN_STATUS_CONFIG).map(([k, v]) => ({ label: statusLabelMap[k] ?? v.label, value: k })),
  ];

  const columns = [
    {
      key: 'client',
      header: t('pages.loans.client'),
      render: (_: unknown, row: Loan) =>
        row.client ? (
          <Link href={`/loans/${row.id}`} className="font-medium text-primary hover:underline">
            {row.client.firstName} {row.client.lastName}
          </Link>
        ) : (
          <Link href={`/loans/${row.id}`} className="font-medium text-primary hover:underline">
            {t('pages.loans.viewLoan')}
          </Link>
        ),
    },
    {
      key: 'loanType',
      header: t('pages.loans.type'),
      render: (_: unknown, row: Loan) => LOAN_TYPE_LABELS[row.loanType] ?? row.loanType,
    },
    {
      key: 'principal',
      header: t('pages.loans.principal'),
      render: (_: unknown, row: Loan) => <CurrencyDisplay value={row.principal} />,
    },
    {
      key: 'interestRate',
      header: t('pages.loans.rate'),
      render: (_: unknown, row: Loan) => `${(row.interestRate * 100).toFixed(2)}%`,
    },
    {
      key: 'termInMonths',
      header: t('pages.loans.term'),
      render: (_: unknown, row: Loan) => `${row.termInMonths}mo`,
    },
    {
      key: 'status',
      header: t('pages.loans.status'),
      render: (_: unknown, row: Loan) => <LoanStatusBadge status={row.status} />,
    },
    {
      key: 'startDate',
      header: t('pages.loans.startDate'),
      render: (_: unknown, row: Loan) => <DateDisplay value={row.startDate} />,
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: Loan) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {row.status === LoanStatus.Pending && (
            <button
              onClick={(e) => { e.stopPropagation(); void approveLoan.mutateAsync(row.id); }}
              className="text-xs font-medium text-green-600 hover:underline disabled:opacity-50"
              disabled={approveLoan.isPending}
            >
              {t('actions.approve')}
            </button>
          )}
          {row.status === LoanStatus.Pending && (
            <button
              onClick={(e) => { e.stopPropagation(); setRejectId(row.id); }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              {t('actions.reject')}
            </button>
          )}
          {row.status === LoanStatus.Approved && (
            <button
              onClick={(e) => { e.stopPropagation(); void activateLoan.mutateAsync(row.id); }}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              disabled={activateLoan.isPending}
            >
              {t('actions.activate')}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); setDeleteError(null); }}
            className="text-xs font-medium text-destructive hover:underline"
          >
            {t('actions.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('pages.loans.title')}</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} {t('pages.loans.totalLoans')}</p>
        </div>
        <Link
          href="/loans/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t('pages.loans.newLoan')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ClientSearch
          selectedId={clientId}
          selectedLabel={clientLabel}
          onSelect={(id, name) => { setClientId(id); setClientLabel(name); setPage(1); }}
          onClear={() => { setClientId(''); setClientLabel(''); setPage(1); }}
          className="w-80"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          aria-label={t('pages.loans.filterByStatus')}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage={t('pages.loans.noLoansFound')}
        onRowClick={(row) => router.push(`/loans/${row.id}`)}
      />

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={t('pages.loans.deleteTitle')}
        description={t('pages.loans.deleteDescription')}
        errorMessage={deleteError ?? undefined}
        confirmLabel={t('actions.delete')}
        variant="danger"
        isLoading={deleteLoan.isPending}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteLoan.mutateAsync(deleteId);
              setDeleteError(null);
              setDeleteId(null);
            } catch (error) {
              if (error instanceof ApiError) {
                setDeleteError(error.message);
                return;
              }
              setDeleteError(t('pages.loans.deleteFailed'));
            }
          }
        }}
        onCancel={() => {
          setDeleteId(null);
          setDeleteError(null);
        }}
      />

      <ConfirmDialog
        open={rejectId !== null}
        title={t('pages.loans.rejectTitle')}
        description={t('pages.loans.rejectDescription')}
        errorMessage={rejectError ?? undefined}
        confirmLabel={t('actions.reject')}
        variant="danger"
        isLoading={rejectLoan.isPending}
        onConfirm={async () => {
          if (rejectId) {
            try {
              await rejectLoan.mutateAsync({ id: rejectId, reason: 'Rejected by officer' });
              setRejectError(null);
              setRejectId(null);
            } catch (error) {
              if (error instanceof ApiError) {
                setRejectError(error.message);
                return;
              }
              setRejectError(t('pages.loans.rejectFailed'));
            }
          }
        }}
        onCancel={() => {
          setRejectId(null);
          setRejectError(null);
        }}
      />
    </div>
  );
}
