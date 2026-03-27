'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api/clients';
import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_CLIENT_SEARCH } from '@/lib/constants';
import type { Client } from '@/types/client';
import { useI18n } from '@/lib/i18n/I18nProvider';

export interface ClientSearchProps {
  selectedId: string;
  selectedLabel: string;
  onSelect: (id: string, name: string) => void;
  onClear: () => void;
  className?: string;
}

export function ClientSearch({
  selectedId,
  selectedLabel,
  onSelect,
  onClear,
  className = 'w-72',
}: ClientSearchProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, DEBOUNCE_CLIENT_SEARCH);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients-search', debouncedSearch],
    queryFn: () => clientsApi.search(debouncedSearch),
    enabled: debouncedSearch.length >= 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleSelect(id: string, name: string) {
    onSelect(id, name);
    setSearch('');
    setOpen(false);
  }

  function handleClear() {
    onClear();
    setSearch('');
    inputRef.current?.focus();
  }

  const showDropdown = open && debouncedSearch.length >= 1;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${
          open ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

        {selectedId && !open ? (
          /* Selected chip in the input */
          <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {selectedLabel
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {selectedLabel}
            </span>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedId ? selectedLabel : t('common.searchClientByNameOrEmail')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={t('common.searchClient')}
            aria-autocomplete="list"
          />
        )}

        {selectedId && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t('common.clearClientFilter')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full z-[100] mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-xl"
          style={{ boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)' }}
        >
          <div className="max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                {t('common.searching')}
              </div>
            )}

            {!isLoading && clients && clients.length === 0 && (
              <div className="px-4 py-4 text-center">
                <p className="text-sm font-medium text-foreground">{t('common.noClientsFound')}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('common.tryDifferentNameOrEmail')}
                </p>
              </div>
            )}

            {clients?.map((client: Client) => (
              <button
                key={client.id}
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                onClick={() =>
                  handleSelect(client.id, `${client.firstName} ${client.lastName}`)
                }
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {client.firstName[0]}
                  {client.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
