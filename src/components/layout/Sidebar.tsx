'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  Calculator,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { useNotificationStats } from '@/hooks/useNotifications';
import { APP_NAME } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

const NAV_ITEMS: Array<{
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>>>;
  labelKey: string;
  badge?: boolean;
}> = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/clients', icon: Users, labelKey: 'nav.clients' },
  { href: '/loans', icon: CreditCard, labelKey: 'nav.loans' },
  { href: '/installments', icon: Calendar, labelKey: 'nav.installments' },
  { href: '/payments', icon: DollarSign, labelKey: 'nav.payments' },
  { href: '/calculations', icon: Calculator, labelKey: 'nav.calculations' },
  { href: '/notifications', icon: Bell, labelKey: 'nav.notifications', badge: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { data: notifStats } = useNotificationStats();
  const { t } = useI18n();

  const unreadCount = notifStats?.unread ?? 0;

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
          L
        </div>
        {sidebarOpen && (
          <span className="truncate text-sm font-semibold text-foreground">{APP_NAME}</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label={t('common.mainNavigation')}>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey, badge }) => {
            const label = t(labelKey);
            const isActive =
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    !sidebarOpen && 'justify-center px-2',
                  )}
                  aria-label={!sidebarOpen ? label : undefined}
                >
                  <div className="relative shrink-0">
                    <Icon className="h-4 w-4" />
                    {badge && unreadCount > 0 && !sidebarOpen && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badge && unreadCount > 0 && (
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle button */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? t('common.collapse') : t('common.expand')}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            !sidebarOpen && 'justify-center px-2',
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>{t('common.collapse')}</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
