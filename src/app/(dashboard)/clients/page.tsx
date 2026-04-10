'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { DataTable } from '@/components/shared/DataTable';
import { ClientSearch } from '@/components/shared/ClientSearch';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableActionButton } from '@/components/shared/TableActionButton';
import { formatCurrency } from '@/lib/formatters';
import { PAGE_SIZE, CREDIT_SCORE_GOOD, CREDIT_SCORE_FAIR } from '@/lib/constants';
import type { Client } from '@/types/client';
import { ApiError } from '@/lib/api/client';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function ClientsPage() {
  const { t } = useI18n();
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
      header: t('pages.clients.name'),
      render: (_: unknown, row: Client) => (
        <Link href={`/clients/${row.id}`} className="font-medium text-primary hover:underline">
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: 'email', header: t('pages.clients.email'), render: (_: unknown, row: Client) => row.email },
    { key: 'phoneNumber', header: t('pages.clients.phone'), render: (_: unknown, row: Client) => row.phoneNumber },
    {
      key: 'creditScore',
      header: t('pages.clients.creditScore'),
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
      header: t('pages.clients.monthlyIncome'),
      render: (_: unknown, row: Client) =>
        row.monthlyIncome ? formatCurrency(row.monthlyIncome) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'isActive',
      header: t('pages.clients.status'),
      render: (_: unknown, row: Client) => (
        <span
          className={
            row.isActive
              ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
              : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500'
          }
        >
          {row.isActive ? t('status.active') : t('status.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_: unknown, row: Client) => (
        <div className="flex items-center gap-2">
          <TableActionButton
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/clients/${row.id}`);
            }}
            variant="primary"
            icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
            aria-label={t('actions.edit')}
          >
            {t('actions.edit')}
          </TableActionButton>
          <TableActionButton
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
              setDeleteError(null);
            }}
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
            aria-label={t('actions.delete')}
          >
            {t('actions.delete')}
          </TableActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('pages.clients.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {t('pages.clients.totalClients')}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t('pages.clients.newClient')}
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
        emptyMessage={t('pages.clients.noClientsFound')}
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
        title={t('pages.clients.deleteTitle')}
        description={t('pages.clients.deleteDescription')}
        errorMessage={deleteError ?? undefined}
        confirmLabel={t('actions.delete')}
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
              setDeleteError(t('pages.clients.deleteFailed'));
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
