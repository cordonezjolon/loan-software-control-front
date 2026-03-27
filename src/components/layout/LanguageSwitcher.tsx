'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Locale } from '@/lib/i18n/messages';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
      <Languages className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t('common.language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('common.language')}
        className="bg-transparent text-xs text-foreground outline-none"
      >
        <option value="en">{t('common.english')}</option>
        <option value="es">{t('common.spanish')}</option>
      </select>
    </label>
  );
}
