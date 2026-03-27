'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { DEFAULT_LOCALE, messages as messageCatalog, type Locale } from './messages';
import { LOCALE_COOKIE_KEY, LOCALE_STORAGE_KEY, isSupportedLocale } from './locale';
import type { TranslateFn, TranslationValues } from './types';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

function getMessage(locale: Locale, key: string): string {
  const segments = key.split('.');
  let current: unknown = messageCatalog[locale];

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return key;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : key;
}

function I18nContextBridge({
  children,
  locale,
  setLocale,
}: {
  children: React.ReactNode;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
  const translate = useTranslations();

  const t = useCallback<TranslateFn>(
    (key: string, values?: TranslationValues): string => {
      try {
        return translate(key as never, values as never);
      } catch {
        const fallback = getMessage(DEFAULT_LOCALE, key);
        return fallback === key ? key : fallback;
      }
    },
    [translate],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.cookie = `${LOCALE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLocale;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(saved) && saved !== locale) {
      setLocaleState(saved);
      return;
    }

    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messageCatalog[locale]}>
      <I18nContextBridge locale={locale} setLocale={setLocale}>
        {children}
      </I18nContextBridge>
    </NextIntlClientProvider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
