import { describe, it, expect } from 'vitest';
import {
  detectBrand,
  luhnValid,
  last4,
  maskedDisplay,
  formatExpiry,
  isValidExpiry,
  expectedLength,
} from '@/lib/cards';

describe('Faz 5 — cards', () => {
  describe('detectBrand', () => {
    it('Visa: 4 ile başlar', () => {
      expect(detectBrand('4242 4242 4242 4242')).toBe('VISA');
    });
    it('Mastercard: 51-55 ile başlar', () => {
      expect(detectBrand('5555 5555 5555 4444')).toBe('MASTERCARD');
    });
    it('Mastercard: 2221 ile başlar (yeni aralık)', () => {
      expect(detectBrand('2221000000000000')).toBe('MASTERCARD');
    });
    it('Amex: 34 ile başlar', () => {
      expect(detectBrand('3400 000000 00009')).toBe('AMEX');
    });
    it('Troy: 9792 ile başlar', () => {
      expect(detectBrand('9792000000000000')).toBe('TROY');
    });
    it('Boş veya tanımsız', () => {
      expect(detectBrand('')).toBe('UNKNOWN');
      expect(detectBrand('1234')).toBe('UNKNOWN');
    });
  });

  describe('luhnValid', () => {
    it('Geçerli Visa test kartı', () => {
      expect(luhnValid('4242424242424242')).toBe(true);
    });
    it('Geçerli Mastercard test kartı', () => {
      expect(luhnValid('5555555555554444')).toBe(true);
    });
    it('Geçersiz kart numarası', () => {
      expect(luhnValid('4242424242424241')).toBe(false);
    });
    it('Çok kısa', () => {
      expect(luhnValid('4242')).toBe(false);
    });
    it('Boşluklar göz ardı edilir', () => {
      expect(luhnValid('4242 4242 4242 4242')).toBe(true);
    });
  });

  describe('last4 & maskedDisplay', () => {
    it('last4: son 4 hane', () => {
      expect(last4('4242 4242 4242 1234')).toBe('1234');
    });
    it('maskedDisplay: kısmi yazımda doğru maske', () => {
      expect(maskedDisplay('1234')).toBe('1234 •••• •••• ••••');
      expect(maskedDisplay('12345678')).toBe('1234 5678 •••• ••••');
    });
    it('maskedDisplay: boşken tüm dotlar', () => {
      expect(maskedDisplay('')).toBe('•••• •••• •••• ••••');
    });
  });

  describe('formatExpiry', () => {
    it('2 hane sonrası slash ekler', () => {
      expect(formatExpiry('1226')).toBe('12/26');
    });
    it('Tek hane: olduğu gibi', () => {
      expect(formatExpiry('1')).toBe('1');
    });
    it('Sadece rakamı koruyur', () => {
      expect(formatExpiry('1a2b/3c4d')).toBe('12/34');
    });
  });

  describe('isValidExpiry', () => {
    it('Geçerli (gelecek)', () => {
      const now = new Date('2026-05-06');
      expect(isValidExpiry(12, 30, now)).toBe(true);
      expect(isValidExpiry(5, 26, now)).toBe(true); // bu ay
    });
    it('Geçmiş ay', () => {
      const now = new Date('2026-05-06');
      expect(isValidExpiry(4, 26, now)).toBe(false);
    });
    it('Geçersiz ay', () => {
      const now = new Date('2026-05-06');
      expect(isValidExpiry(13, 26, now)).toBe(false);
      expect(isValidExpiry(0, 26, now)).toBe(false);
    });
  });

  describe('expectedLength', () => {
    it('Amex 15, diğerleri 16', () => {
      expect(expectedLength('AMEX')).toBe(15);
      expect(expectedLength('VISA')).toBe(16);
      expect(expectedLength('MASTERCARD')).toBe(16);
      expect(expectedLength('TROY')).toBe(16);
    });
  });
});
