import type { Locale } from './messages';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './messages';

export const LOCALE_COOKIE_KEY = 'app_locale';
export const LOCALE_STORAGE_KEY = 'app_locale';

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const language = acceptLanguage.toLowerCase();
  if (language.startsWith('es')) return 'es';

  return DEFAULT_LOCALE;
}
