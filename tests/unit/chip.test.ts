import { describe, it, expect } from 'vitest';
import { applyEarn, applySpend } from '@/lib/chip';

const empty = { balance: 0, lifetimeEarned: 0, lifetimeSpent: 0 };

describe('Faz 5 — chip wallet', () => {
  describe('applyEarn', () => {
    it('Boş bakiyeye 12 chip eklenir', () => {
      const r = applyEarn(empty, 12);
      expect(r.balance).toBe(12);
      expect(r.lifetimeEarned).toBe(12);
      expect(r.lifetimeSpent).toBe(0);
    });

    it('Mevcut bakiyeye eklenir', () => {
      const r = applyEarn({ balance: 25, lifetimeEarned: 50, lifetimeSpent: 25 }, 8);
      expect(r.balance).toBe(33);
      expect(r.lifetimeEarned).toBe(58);
      expect(r.lifetimeSpent).toBe(25);
    });

    it('Negatif/sıfır → değişmez', () => {
      expect(applyEarn(empty, 0)).toEqual(empty);
      expect(applyEarn(empty, -5)).toEqual(empty);
    });

    it('Yuvarlama', () => {
      const r = applyEarn(empty, 11.866);
      expect(r.balance).toBe(11.87);
    });
  });

  describe('applySpend', () => {
    it('Yeterli bakiyeden harcama', () => {
      const before = { balance: 50, lifetimeEarned: 100, lifetimeSpent: 50 };
      const { snapshot, actual } = applySpend(before, 30);
      expect(actual).toBe(30);
      expect(snapshot.balance).toBe(20);
      expect(snapshot.lifetimeSpent).toBe(80);
      expect(snapshot.lifetimeEarned).toBe(100);
    });

    it('Yetersiz bakiyede sadece harcanabilen', () => {
      const before = { balance: 10, lifetimeEarned: 10, lifetimeSpent: 0 };
      const { snapshot, actual } = applySpend(before, 25);
      expect(actual).toBe(10);
      expect(snapshot.balance).toBe(0);
      expect(snapshot.lifetimeSpent).toBe(10);
    });

    it('Boş bakiyeden harcama', () => {
      const { snapshot, actual } = applySpend(empty, 50);
      expect(actual).toBe(0);
      expect(snapshot).toEqual(empty);
    });
  });

  describe('earn → spend invariant', () => {
    it('lifetimeEarned == sum of earns; lifetimeSpent == sum of spends', () => {
      let s = empty;
      s = applyEarn(s, 25);
      s = applyEarn(s, 12);
      s = applySpend(s, 10).snapshot;
      s = applyEarn(s, 5);
      s = applySpend(s, 8).snapshot;
      expect(s.lifetimeEarned).toBe(42); // 25+12+5
      expect(s.lifetimeSpent).toBe(18); // 10+8
      expect(s.balance).toBe(42 - 18);
    });
  });
});
