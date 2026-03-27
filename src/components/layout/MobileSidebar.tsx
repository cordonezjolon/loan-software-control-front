'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Users, CreditCard, Calendar, DollarSign, Calculator, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { APP_NAME } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/clients', icon: Users, labelKey: 'nav.clients' },
  { href: '/loans', icon: CreditCard, labelKey: 'nav.loans' },
  { href: '/installments', icon: Calendar, labelKey: 'nav.installments' },
  { href: '/payments', icon: DollarSign, labelKey: 'nav.payments' },
  { href: '/calculations', icon: Calculator, labelKey: 'nav.calculations' },
  { href: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
] as const;

export function MobileSidebar() {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { t } = useI18n();

  if (!mobileSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border lg:hidden">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              L
            </div>
            <span className="text-sm font-semibold text-foreground">{APP_NAME}</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            aria-label={t('common.closeNavigation')}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2" aria-label={t('common.mobileNavigation')}>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
              const label = t(labelKey);
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
