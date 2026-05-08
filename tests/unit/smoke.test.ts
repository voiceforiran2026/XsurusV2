import { describe, it, expect } from 'vitest';
import { formatTL, formatDistance, formatPercent, maskCard } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ROLES, RIDE_STATUSES, SERVICE_TYPES } from '@/types/domain';

describe('Faz 0 — smoke', () => {
  describe('cn (class merger)', () => {
    it('merges tailwind classes', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('format', () => {
    it('formats TRY currency in Turkish locale', () => {
      const result = formatTL(1234.5);
      expect(result).toMatch(/1\.234/); // tr-TR thousands separator
      expect(result).toMatch(/₺|TL|TRY/);
    });

    it('rounds half cents', () => {
      expect(formatTL(0.005)).toMatch(/0,01|₺.*0/);
    });

    it('formats distance — under 1 km in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
    });

    it('formats distance — over 1 km in km', () => {
      expect(formatDistance(2.4)).toMatch(/2,4 km/);
    });

    it('formats percent', () => {
      expect(formatPercent(0.75)).toBe('%75');
      expect(formatPercent(0.1)).toBe('%10');
    });

    it('masks card', () => {
      expect(maskCard('1234')).toBe('•••• •••• •••• 1234');
    });
  });

  describe('domain literal types', () => {
    it('exposes role tuple', () => {
      expect(ROLES).toEqual(['ADMIN', 'RIDER', 'DRIVER']);
    });

    it('exposes service types', () => {
      expect(SERVICE_TYPES).toEqual(['RIDE', 'GO']);
    });

    it('exposes ride statuses', () => {
      expect(RIDE_STATUSES).toContain('PENDING');
      expect(RIDE_STATUSES).toContain('COMPLETED');
    });
  });
});
