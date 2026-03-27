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

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  ...Object.entries(LOAN_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })),
];

export default function LoansPage() {
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

  const columns = [
    {
      key: 'client',
      header: 'Client',
      render: (_: unknown, row: Loan) =>
        row.client ? (
          <Link href={`/loans/${row.id}`} className="font-medium text-primary hover:underline">
            {row.client.firstName} {row.client.lastName}
          </Link>
        ) : (
          <Link href={`/loans/${row.id}`} className="font-medium text-primary hover:underline">
            View Loan
          </Link>
        ),
    },
    {
      key: 'loanType',
      header: 'Type',
      render: (_: unknown, row: Loan) => LOAN_TYPE_LABELS[row.loanType] ?? row.loanType,
    },
    {
      key: 'principal',
      header: 'Principal',
      render: (_: unknown, row: Loan) => <CurrencyDisplay value={row.principal} />,
    },
    {
      key: 'interestRate',
      header: 'Rate',
      render: (_: unknown, row: Loan) => `${(row.interestRate * 100).toFixed(2)}%`,
    },
    {
      key: 'termInMonths',
      header: 'Term',
      render: (_: unknown, row: Loan) => `${row.termInMonths}mo`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: unknown, row: Loan) => <LoanStatusBadge status={row.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
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
              Approve
            </button>
          )}
          {row.status === LoanStatus.Pending && (
            <button
              onClick={(e) => { e.stopPropagation(); setRejectId(row.id); }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Reject
            </button>
          )}
          {row.status === LoanStatus.Approved && (
            <button
              onClick={(e) => { e.stopPropagation(); void activateLoan.mutateAsync(row.id); }}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              disabled={activateLoan.isPending}
            >
              Activate
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); setDeleteError(null); }}
            className="text-xs font-medium text-destructive hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Loans</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} total loans</p>
        </div>
        <Link
          href="/loans/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Loan
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
          aria-label="Filter by status"
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
        emptyMessage="No loans found."
        onRowClick={(row) => router.push(`/loans/${row.id}`)}
      />

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} className="mt-4" />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Loan"
        description="Are you sure you want to delete this loan? This will also remove all installments."
        errorMessage={deleteError ?? undefined}
        confirmLabel="Delete"
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
              setDeleteError('Unable to delete loan. Please try again.');
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
        title="Reject Loan"
        description="Are you sure you want to reject this loan application?"
        errorMessage={rejectError ?? undefined}
        confirmLabel="Reject"
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
              setRejectError('Unable to reject loan. Please try again.');
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
