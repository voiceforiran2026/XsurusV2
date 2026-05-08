import { describe, it, expect } from 'vitest';
import {
  PRICING_CONFIG,
  calculateFare,
  settleRide,
  applyChipPayment,
  roundTL,
} from '@/lib/pricing';

describe('Faz 3 — pricing', () => {
  describe('calculateFare', () => {
    it('RIDE: 0 km → 25 ₺ taban', () => {
      expect(calculateFare('RIDE', 0)).toBe(25);
    });

    it('RIDE: 5 km → 25 + 5×12 = 85 ₺', () => {
      expect(calculateFare('RIDE', 5)).toBe(85);
    });

    it('GO: aynı tarife (RIDE ile birebir)', () => {
      expect(calculateFare('GO', 5)).toBe(calculateFare('RIDE', 5));
    });

    it('Ondalıklı mesafe → 2 ondalığa yuvarlanır', () => {
      // 25 + 3.7×12 = 25 + 44.4 = 69.4
      expect(calculateFare('RIDE', 3.7)).toBe(69.4);
    });

    it('Negatif mesafe → hata', () => {
      expect(() => calculateFare('RIDE', -1)).toThrow();
    });

    it('Geçersiz mesafe → hata', () => {
      expect(() => calculateFare('RIDE', NaN)).toThrow();
    });
  });

  describe('settleRide — havuz invariant', () => {
    it('100 ₺ → 75 + 15 + 10 = 100', () => {
      const r = settleRide(100);
      expect(r.driverEarning).toBe(75);
      expect(r.systemCommission).toBe(15);
      expect(r.chipReward).toBe(10);
      expect(r.driverEarning + r.systemCommission + r.chipReward).toBe(100);
    });

    it('85 ₺ → toplam 85 (yuvarlama farkı komisyona)', () => {
      const r = settleRide(85);
      const total = r.driverEarning + r.systemCommission + r.chipReward;
      expect(total).toBe(85);
    });

    it('Toplam invariant: 100 farklı ücrette tutarlı', () => {
      for (let i = 1; i <= 100; i++) {
        const fare = roundTL(25 + i * 1.37);
        const r = settleRide(fare);
        const total = roundTL(
          r.driverEarning + r.systemCommission + r.chipReward,
        );
        expect(total).toBe(fare);
      }
    });

    it('Çok küçük ücret (1 ₺)', () => {
      const r = settleRide(1);
      const total = r.driverEarning + r.systemCommission + r.chipReward;
      expect(total).toBe(1);
      expect(r.driverEarning).toBeGreaterThanOrEqual(0);
    });

    it('Negatif ücret → hata', () => {
      expect(() => settleRide(-5)).toThrow();
    });
  });

  describe('applyChipPayment', () => {
    it('Yeterli chip: tamamen chip ile öde', () => {
      const r = applyChipPayment(60, 100);
      expect(r.chipUsed).toBe(60);
      expect(r.cardCharged).toBe(0);
    });

    it('Yetersiz chip: kalanı karta düşer', () => {
      const r = applyChipPayment(60, 25);
      expect(r.chipUsed).toBe(25);
      expect(r.cardCharged).toBe(35);
    });

    it('Sıfır chip: tamamı karta', () => {
      const r = applyChipPayment(60, 0);
      expect(r.chipUsed).toBe(0);
      expect(r.cardCharged).toBe(60);
    });

    it('Negatif chip bakiyesi 0 muamelesi görür', () => {
      const r = applyChipPayment(60, -10);
      expect(r.chipUsed).toBe(0);
      expect(r.cardCharged).toBe(60);
    });
  });

  describe('PRICING_CONFIG', () => {
    it('RIDE ve GO aynı tarife', () => {
      expect(PRICING_CONFIG.RIDE).toEqual(PRICING_CONFIG.GO);
    });

    it('Dağılım toplamı 1.0', () => {
      expect(
        PRICING_CONFIG.driverShare +
          PRICING_CONFIG.systemCommission +
          PRICING_CONFIG.chipReward,
      ).toBe(1.0);
    });
  });
});
