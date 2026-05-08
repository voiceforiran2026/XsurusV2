import { describe, it, expect } from 'vitest';
import {
  searchMockPlaces,
  getMockPlaceById,
  MOCK_PLACES,
} from '@/lib/places-mock';

describe('Faz 3 — places mock', () => {
  it('Boş query → boş sonuç', () => {
    expect(searchMockPlaces('')).toEqual([]);
    expect(searchMockPlaces('   ')).toEqual([]);
  });

  it('Tam eşleşme: "Taksim" → Taksim Meydanı önde', () => {
    const r = searchMockPlaces('Taksim');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].name).toMatch(/Taksim/);
  });

  it('Türkçe karakter normalize: "kadikoy" → Kadıköy', () => {
    const r = searchMockPlaces('kadikoy');
    expect(r.length).toBeGreaterThan(0);
    expect(r.some((p) => p.name.includes('Kadıköy'))).toBe(true);
  });

  it('İlçe ile arama: "Beşiktaş" sonuçları döner', () => {
    const r = searchMockPlaces('Beşiktaş');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.district === 'Beşiktaş' || p.name.includes('Beşiktaş'))).toBe(true);
  });

  it('Sonuç limiti uygulanır (varsayılan 6)', () => {
    const r = searchMockPlaces('istanbul');
    expect(r.length).toBeLessThanOrEqual(6);
  });

  it('getMockPlaceById ile placeId çözümlenir', () => {
    const p = getMockPlaceById('tr-ist-001');
    expect(p?.name).toBe('Taksim Meydanı');
  });

  it('Bilinmeyen placeId → null', () => {
    expect(getMockPlaceById('does-not-exist')).toBeNull();
  });

  it('Veriseti minimum 50+ adres içerir', () => {
    expect(MOCK_PLACES.length).toBeGreaterThanOrEqual(50);
  });

  it('Tüm placeId değerleri tekil', () => {
    const ids = new Set(MOCK_PLACES.map((p) => p.placeId));
    expect(ids.size).toBe(MOCK_PLACES.length);
  });
});
