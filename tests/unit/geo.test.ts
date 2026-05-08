import { describe, it, expect } from 'vitest';
import { haversineKm, estimateRoadDistanceKm } from '@/lib/geo';

const TAKSIM = { lat: 41.0370, lng: 28.9850 };
const KADIKOY = { lat: 40.9929, lng: 29.0260 };
const SARIYER = { lat: 41.1670, lng: 29.0550 };

describe('Faz 3 — geo', () => {
  it('Aynı nokta → 0 km', () => {
    expect(haversineKm(TAKSIM, TAKSIM)).toBeCloseTo(0, 5);
  });

  it('Taksim → Kadıköy ~5-7 km (haversine)', () => {
    const d = haversineKm(TAKSIM, KADIKOY);
    expect(d).toBeGreaterThan(4);
    expect(d).toBeLessThan(8);
  });

  it('Taksim → Sarıyer ~14-17 km', () => {
    const d = haversineKm(TAKSIM, SARIYER);
    expect(d).toBeGreaterThan(13);
    expect(d).toBeLessThan(18);
  });

  it('Simetri: a→b == b→a', () => {
    expect(haversineKm(TAKSIM, SARIYER)).toBeCloseTo(
      haversineKm(SARIYER, TAKSIM),
      5,
    );
  });

  it('estimateRoadDistanceKm = haversine × 1.3', () => {
    const h = haversineKm(TAKSIM, KADIKOY);
    const r = estimateRoadDistanceKm(TAKSIM, KADIKOY);
    expect(r).toBeCloseTo(h * 1.3, 5);
  });
});
