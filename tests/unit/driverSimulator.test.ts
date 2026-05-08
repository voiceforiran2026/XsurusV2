import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  makeState,
  stepToward,
  randomStartNear,
  startSimulator,
} from '@/lib/driverSimulator';

describe('driverSimulator', () => {
  describe('makeState', () => {
    it('initial state distance hesaplar', () => {
      const s = makeState({ lat: 41, lng: 29 }, { lat: 41.001, lng: 29 });
      expect(s.distanceRemaining).toBeGreaterThan(0.05);
      expect(s.distanceRemaining).toBeLessThan(0.2);
    });

    it("current ve target deep-copy'dir (input mutate edilmez)", () => {
      const start = { lat: 41, lng: 29 };
      const target = { lat: 41.5, lng: 29.5 };
      const s = makeState(start, target);
      s.current.lat = 0;
      expect(start.lat).toBe(41);
    });
  });

  describe('stepToward', () => {
    it('hedefe yaklaştıkça mesafe azalır', () => {
      const s = makeState({ lat: 41, lng: 29 }, { lat: 41.05, lng: 29 });
      const beforeDist = s.distanceRemaining;
      stepToward(s, 0.5);
      expect(s.distanceRemaining).toBeLessThan(beforeDist);
    });

    it('eşik altına inince reached=true ve target snap eder', () => {
      const target = { lat: 41.001, lng: 29.001 };
      const s = makeState({ lat: 41, lng: 29 }, target);
      const r = stepToward(s, 100, 1); // büyük step + büyük eşik
      expect(r.reached).toBe(true);
      expect(s.current.lat).toBe(target.lat);
      expect(s.current.lng).toBe(target.lng);
    });

    it('hedefte değilse reached=false', () => {
      const s = makeState({ lat: 41, lng: 29 }, { lat: 41.5, lng: 29.5 });
      const r = stepToward(s, 0.05);
      expect(r.reached).toBe(false);
      expect(s.distanceRemaining).toBeGreaterThan(0.08);
    });
  });

  describe('randomStartNear', () => {
    it('hedefe ~radiusKm uzaklıkta nokta üretir', () => {
      const target = { lat: 41, lng: 29 };
      for (let i = 0; i < 20; i++) {
        const start = randomStartNear(target, 2);
        // Kabaca 0.5km - 2km arası
        const dx = Math.abs(start.lat - target.lat);
        const dy = Math.abs(start.lng - target.lng);
        expect(dx + dy).toBeGreaterThan(0);
        expect(dx).toBeLessThan(0.05);
        expect(dy).toBeLessThan(0.05);
      }
    });
  });

  describe('startSimulator', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('interval başlatır, onStep çağırır, hedefe ulaşınca durur', async () => {
      const onStep = vi.fn();
      const target = { lat: 41.0001, lng: 29.0001 };
      const handle = startSimulator(
        makeState({ lat: 41, lng: 29 }, target),
        onStep,
        { stepKm: 1, intervalMs: 100, arrivedThresholdKm: 1 },
      );
      // İlk microtask tick
      await vi.runAllTicks();
      // 5 interval ileri
      vi.advanceTimersByTime(500);
      // onStep en az bir kez çağrılmış olmalı
      expect(onStep).toHaveBeenCalled();
      // Reached=true gelmiş olmalı
      const reachedCall = onStep.mock.calls.find((c) => c[0].reached === true);
      expect(reachedCall).toBeDefined();
      handle.stop();
    });

    it('handle.stop() interval temizler', () => {
      const onStep = vi.fn();
      const handle = startSimulator(
        makeState({ lat: 41, lng: 29 }, { lat: 42, lng: 30 }),
        onStep,
        { intervalMs: 100 },
      );
      vi.advanceTimersByTime(150);
      const callsBefore = onStep.mock.calls.length;
      handle.stop();
      vi.advanceTimersByTime(500);
      expect(onStep.mock.calls.length).toBe(callsBefore);
    });
  });
});
