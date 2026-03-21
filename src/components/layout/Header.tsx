'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStats } from '@/hooks/useNotifications';
import { Breadcrumbs } from './Breadcrumbs';

export function Header() {
  const { toggleMobileSidebar } = useUiStore();
  const { user, logout } = useAuth();
  const { data: notifStats } = useNotificationStats();
  const unreadCount = notifStats?.unread ?? 0;

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        aria-label="Open navigation"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <Link
          href="/notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{user?.username ?? 'User'}</span>
          <span className="text-xs text-muted-foreground capitalize">({user?.role})</span>
          <button
            onClick={logout}
            aria-label="Log out"
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
