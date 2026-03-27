'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useNotifications, useNotificationStats, useMarkNotificationRead } from '@/hooks/useNotifications';
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_PRIORITY_CONFIG } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { NotificationStatus, type NotificationCategory, type NotificationPriority } from '@/types/notification';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function NotificationsPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<'' | NotificationStatus>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: stats } = useNotificationStats();
  const { data, isLoading, error } = useNotifications({
    ...(status ? { status } : {}),
    page,
    limit,
  });
  const markReadMutation = useMarkNotificationRead();

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const STATUS_TABS: { label: string; value: '' | NotificationStatus }[] = [
    { label: t('status.all'), value: '' },
    { label: t('pages.notifications.unread'), value: NotificationStatus.Pending },
    { label: t('status.sent'), value: NotificationStatus.Sent },
    { label: t('status.read'), value: NotificationStatus.Read },
  ];

  function handleStatusTab(tab: '' | NotificationStatus) {
    setStatus(tab);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Bell className="h-5 w-5" />
            {t('pages.notifications.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('pages.notifications.subtitle')}</p>
        </div>

        {stats && stats.unread > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            {stats.unread} {t('pages.notifications.unread').toLowerCase()}
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('pages.notifications.total'), value: stats.total ?? 0 },
            { label: t('pages.notifications.unread'), value: stats.unread ?? 0 },
            { label: t('pages.notifications.delivered'), value: stats.delivered ?? 0 },
            { label: t('pages.notifications.failed'), value: stats.failed ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-3 shadow-card">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleStatusTab(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              status === tab.value
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pr-1 text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs">{total} {t('pages.notifications.totalLabel')}</span>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-muted-foreground">{t('pages.notifications.failedToLoad')}</div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title={t('pages.notifications.noNotifications')}
            description={t('pages.notifications.allCaughtUp')}
            icon={<Bell className="h-10 w-10 text-muted-foreground/30" />}
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const priorityConfig = NOTIFICATION_PRIORITY_CONFIG[n.priority as NotificationPriority];
              const isUnread = n.status !== 'read';

              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/30 ${
                    isUnread ? 'bg-primary/[0.02]' : ''
                  }`}
                >
                  {/* Priority dot */}
                  <span
                    className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: priorityConfig?.color ?? '#94a3b8' }}
                    title={`${t('pages.notifications.priority')}: ${n.priority}`}
                    aria-label={`${t('pages.notifications.priority')}: ${n.priority}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm ${isUnread ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                        {n.subject}
                      </p>
                      <span className="rounded-full border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                        {NOTIFICATION_CATEGORY_LABELS[n.category as NotificationCategory] ?? n.category}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-xs font-medium"
                        style={{
                          color: priorityConfig?.color ?? '#64748b',
                          backgroundColor: priorityConfig?.bg ?? '#f1f5f9',
                        }}
                      >
                        {n.priority}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={t('actions.markAsRead')}
                      aria-label={t('actions.markAsRead')}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
