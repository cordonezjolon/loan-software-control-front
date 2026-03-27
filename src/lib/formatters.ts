import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { APP_CURRENCY, APP_LOCALE } from './constants';

export const formatCurrency = (value: number, currency = APP_CURRENCY): string =>
  new Intl.NumberFormat(APP_LOCALE, { style: 'currency', currency, minimumFractionDigits: 2 }).format(
    value,
  );

export const formatPercent = (value: number): string =>
  new Intl.NumberFormat(APP_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

export const formatMonths = (months: number): string => {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    return remaining > 0 ? `${years}y ${remaining}m` : `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${months} month${months !== 1 ? 's' : ''}`;
};
