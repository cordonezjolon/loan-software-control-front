'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <nav
      aria-label={t('common.pagination')}
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label={t('common.previousPage')}
        className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ‹
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <button
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'min-w-[2rem] rounded-md px-2 py-1 text-sm font-medium',
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent',
              )}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label={t('common.nextPage')}
        className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </nav>
  );
}
