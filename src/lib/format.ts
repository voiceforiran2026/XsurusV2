import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const tlFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function formatTL(amount: number): string {
  return tlFormatter.format(Math.round(amount * 100) / 100);
}

export function formatNumber(n: number): string {
  return numberFormatter.format(n);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${decimalFormatter.format(km)} km`;
}

export function formatDate(date: Date | string, pattern = 'd MMM yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: tr });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'd MMM yyyy, HH:mm');
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: tr, addSuffix: true });
}

export function formatPercent(ratio: number): string {
  return `%${Math.round(ratio * 100)}`;
}

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function maskCard(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}
