import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/messages';
import { LOCALE_COOKIE_KEY, isSupportedLocale, resolveLocaleFromHeader } from '@/lib/i18n/locale';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Loan Management',
  description: 'Comprehensive loan management platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  const headerLocale = resolveLocaleFromHeader(headerStore.get('accept-language'));
  const locale: Locale = isSupportedLocale(cookieLocale) ? cookieLocale : headerLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale} className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
