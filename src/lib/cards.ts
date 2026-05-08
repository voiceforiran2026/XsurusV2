// Kredi kartı yardımcıları — yan etki yok, test edilebilir.
// Demo amaçlı: PAN saklamayız, sadece last4 + brand DB'ye yazılır.

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY' | 'UNKNOWN';

const onlyDigits = (s: string) => s.replace(/\D/g, '');

export function detectBrand(value: string): CardBrand {
  const d = onlyDigits(value);
  if (d.length === 0) return 'UNKNOWN';
  if (/^4/.test(d)) return 'VISA';
  // Mastercard: 51-55 veya 2221-2720
  if (/^5[1-5]/.test(d)) return 'MASTERCARD';
  if (/^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(d))
    return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  if (/^9792/.test(d)) return 'TROY';
  return 'UNKNOWN';
}

export function brandLabel(b: CardBrand): string {
  switch (b) {
    case 'VISA':
      return 'Visa';
    case 'MASTERCARD':
      return 'Mastercard';
    case 'AMEX':
      return 'Amex';
    case 'TROY':
      return 'Troy';
    default:
      return 'Kart';
  }
}

export function expectedLength(brand: CardBrand): number {
  return brand === 'AMEX' ? 15 : 16;
}

/**
 * Luhn check digit doğrulaması.
 */
export function luhnValid(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function last4(value: string): string {
  const d = onlyDigits(value);
  return d.slice(-4);
}

export function maskedDisplay(value: string): string {
  const d = onlyDigits(value);
  if (d.length === 0) return '•••• •••• •••• ••••';
  // Yazılırken: doğru kısımları göster, kalanı dot
  const groups = [
    d.slice(0, 4).padEnd(4, '•'),
    d.slice(4, 8).padEnd(4, '•'),
    d.slice(8, 12).padEnd(4, '•'),
    d.slice(12, 16).padEnd(4, '•'),
  ];
  return groups.join(' ');
}

export function formatExpiry(value: string): string {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function isValidExpiry(mm: number, yy: number, now = new Date()): boolean {
  if (!Number.isInteger(mm) || mm < 1 || mm > 12) return false;
  if (!Number.isInteger(yy) || yy < 0 || yy > 99) return false;
  const fullYear = 2000 + yy;
  const lastDayOfMonth = new Date(fullYear, mm, 0); // ayın son günü
  return lastDayOfMonth.getTime() >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}
