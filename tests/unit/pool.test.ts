import { describe, it, expect } from 'vitest';
import { buildSettlement, summarizePool } from '@/lib/pool';

describe('Faz 6 — pool ledger', () => {
  describe('buildSettlement', () => {
    it('Tek yolculuk → 4 satır ledger', () => {
      const r = buildSettlement(100, 'abc123');
      expect(r.ledger).toHaveLength(4);
      const types = r.ledger.map((e) => e.type);
      expect(types).toEqual([
        'RIDE_INFLOW',
        'DRIVER_PAYOUT',
        'CHIP_RESERVE',
        'COMMISSION',
      ]);
    });

    it('100 ₺: 75 + 10 + 15 = 100', () => {
      const r = buildSettlement(100, 'x');
      expect(r.driverEarning).toBe(75);
      expect(r.chipReward).toBe(10);
      expect(r.systemCommission).toBe(15);
    });

    it('Invariant: ledger toplamı (driver+chip+commission) == inflow', () => {
      const r = buildSettlement(118.44, 'x');
      const inflow = r.ledger.find((e) => e.type === 'RIDE_INFLOW')!.amount;
      const driver = r.ledger.find((e) => e.type === 'DRIVER_PAYOUT')!.amount;
      const chip = r.ledger.find((e) => e.type === 'CHIP_RESERVE')!.amount;
      const commission = r.ledger.find((e) => e.type === 'COMMISSION')!.amount;
      expect(inflow).toBe(118.44);
      expect(driver + chip + commission).toBe(inflow);
    });

    it('Invariant 200 farklı ücrette tutarlı', () => {
      for (let i = 1; i <= 200; i++) {
        const fare = Math.round((25 + i * 1.31) * 100) / 100;
        const r = buildSettlement(fare, `r-${i}`);
        const inflow = r.ledger.find((e) => e.type === 'RIDE_INFLOW')!.amount;
        const driver = r.ledger.find((e) => e.type === 'DRIVER_PAYOUT')!.amount;
        const chip = r.ledger.find((e) => e.type === 'CHIP_RESERVE')!.amount;
        const commission = r.ledger.find((e) => e.type === 'COMMISSION')!.amount;
        const total = Math.round((driver + chip + commission) * 100) / 100;
        expect(inflow).toBe(fare);
        expect(total).toBe(fare);
      }
    });

    it('rideId açıklamada referans olur', () => {
      const r = buildSettlement(50, 'cmou1234567');
      expect(r.ledger[0].description).toContain('234567');
    });
  });

  describe('summarizePool', () => {
    it('Boş entry listesi → tüm sayaçlar 0', () => {
      const s = summarizePool([]);
      expect(s.totalInflow).toBe(0);
      expect(s.totalDriverPayout).toBe(0);
      expect(s.totalCommission).toBe(0);
    });

    it('3 yolculuğu doğru topluyor', () => {
      const e1 = buildSettlement(100, 'a').ledger;
      const e2 = buildSettlement(200, 'b').ledger;
      const e3 = buildSettlement(50, 'c').ledger;
      const all = [...e1, ...e2, ...e3];
      const s = summarizePool(all);
      expect(s.totalInflow).toBe(350);
      expect(s.totalDriverPayout).toBe(75 + 150 + 37.5);
      expect(s.totalChipReserve).toBe(10 + 20 + 5);
      // sistem komisyonu = inflow - driver - chip = 350 - 262.5 - 35 = 52.5
      expect(s.totalCommission).toBe(52.5);
    });

    it('Pool invariant: inflow == driver + chip + commission', () => {
      const ledger = [
        ...buildSettlement(118.44, 'a').ledger,
        ...buildSettlement(73.5, 'b').ledger,
        ...buildSettlement(220.05, 'c').ledger,
      ];
      const s = summarizePool(ledger);
      const sum =
        Math.round(
          (s.totalDriverPayout + s.totalChipReserve + s.totalCommission) * 100,
        ) / 100;
      expect(s.totalInflow).toBe(sum);
    });
  });
});
