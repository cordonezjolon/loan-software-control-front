'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { DataTable } from '@/components/shared/DataTable';
import { ClientSearch } from '@/components/shared/ClientSearch';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatCurrency } from '@/lib/formatters';
import { PAGE_SIZE, CREDIT_SCORE_GOOD, CREDIT_SCORE_FAIR } from '@/lib/constants';
import type { Client } from '@/types/client';
import { ApiError } from '@/lib/api/client';

export default function ClientsPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading } = useClients({
    page,
    limit: PAGE_SIZE,
  });

  const deleteClient = useDeleteClient();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (_: unknown, row: Client) => (
        <Link href={`/clients/${row.id}`} className="font-medium text-primary hover:underline">
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', render: (_: unknown, row: Client) => row.email },
    { key: 'phoneNumber', header: 'Phone', render: (_: unknown, row: Client) => row.phoneNumber },
    {
      key: 'creditScore',
      header: 'Credit Score',
      render: (_: unknown, row: Client) =>
        row.creditScore ? (
          <span
            className={
              row.creditScore >= CREDIT_SCORE_GOOD
                ? 'text-green-600'
                : row.creditScore >= CREDIT_SCORE_FAIR
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          >
            {row.creditScore}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'monthlyIncome',
      header: 'Monthly Income',
      render: (_: unknown, row: Client) =>
        row.monthlyIncome ? formatCurrency(row.monthlyIncome) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_: unknown, row: Client) => (
        <span
          className={
            row.isActive
              ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
              : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500'
          }
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: Client) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/clients/${row.id}`);
            }}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
              setDeleteError(null);
            }}
            className="text-xs text-destructive hover:underline"
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
          <h1 className="text-xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} total clients
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Client
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <ClientSearch
          selectedId={clientId}
          selectedLabel={clientLabel}
          onSelect={(id, name) => {
            setClientId(id);
            setClientLabel(name);
            router.push(`/clients/${id}`);
          }}
          onClear={() => { setClientId(''); setClientLabel(''); setPage(1); }}
          className="w-80"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No clients found."
        onRowClick={(row) => router.push(`/clients/${row.id}`)}
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        errorMessage={deleteError ?? undefined}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteClient.isPending}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteClient.mutateAsync(deleteId);
              setDeleteError(null);
              setDeleteId(null);
            } catch (error) {
              if (error instanceof ApiError) {
                setDeleteError(error.message);
                return;
              }
              setDeleteError('Unable to delete client. Please try again.');
            }
          }
        }}
        onCancel={() => {
          setDeleteId(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
