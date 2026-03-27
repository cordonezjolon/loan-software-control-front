'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function Breadcrumbs({ className }: { className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const labels: Record<string, string> = {
    clients: t('breadcrumbs.clients'),
    loans: t('breadcrumbs.loans'),
    installments: t('breadcrumbs.installments'),
    payments: t('breadcrumbs.payments'),
    calculations: t('breadcrumbs.calculations'),
    notifications: t('breadcrumbs.notifications'),
    dashboard: t('breadcrumbs.dashboard'),
    new: t('breadcrumbs.new'),
  };

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t('common.home')}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((seg, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/');
        const label = labels[seg] ?? (seg.length === 36 ? t('common.detail') : seg);
        const isLast = idx === segments.length - 1;

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
