// Saf fiyatlandırma fonksiyonları — yan etki yok, test edilebilir.
//
// Onaylanan kararlar (2026-05-06):
//   - RIDE ve GO **aynı**: 25 ₺ taban + 12 ₺/km
//   - Dağılım: %75 sürücü + %15 sistem + %10 chip = %100
//   - 1 chip = 1 ₺
//
// Yuvarlama stratejisi:
//   - Tüm para değerleri 2 ondalığa yuvarlanır.
//   - settleRide() içinde dağıtım sonrası toplam == finalFare olacak şekilde
//     yuvarlama farkı sistem komisyonuna kaydırılır (havuz invariant'ı).

import type { ServiceType } from '@/types/domain';

export const PRICING_CONFIG = {
  RIDE: { base: 25, perKm: 12 },
  GO: { base: 25, perKm: 12 },
  driverShare: 0.75,
  systemCommission: 0.15,
  chipReward: 0.1,
} as const;

export function roundTL(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Tahmini ücreti hesaplar. Hizmet türü ve mesafe (km) verilir.
 */
export function calculateFare(
  serviceType: ServiceType,
  distanceKm: number,
): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('Mesafe geçerli bir pozitif sayı olmalıdır');
  }
  const cfg = PRICING_CONFIG[serviceType];
  return roundTL(cfg.base + cfg.perKm * distanceKm);
}

export interface RideSettlement {
  driverEarning: number;
  systemCommission: number;
  chipReward: number;
}

/**
 * Tamamlanan yolculuk ücretini havuz dağıtımına böler.
 *
 * **Invariant:** `driverEarning + systemCommission + chipReward === finalFare`
 * Yuvarlama farkları systemCommission'a kaydırılır.
 */
export function settleRide(finalFare: number): RideSettlement {
  if (!Number.isFinite(finalFare) || finalFare < 0) {
    throw new Error('Ücret geçerli bir pozitif sayı olmalıdır');
  }
  const driverEarning = roundTL(finalFare * PRICING_CONFIG.driverShare);
  const chipReward = roundTL(finalFare * PRICING_CONFIG.chipReward);
  // Sistem komisyonu = finalFare - driverEarning - chipReward (yuvarlama farkını yutar)
  const systemCommission = roundTL(finalFare - driverEarning - chipReward);
  return { driverEarning, systemCommission, chipReward };
}

/**
 * Yolcunun chip ile öderken ne kadar düşeceğini hesaplar.
 * Chip bakiyesi yetmiyorsa yetersiz miktarı CARD ile ödenir.
 */
export function applyChipPayment(
  finalFare: number,
  availableChip: number,
): { chipUsed: number; cardCharged: number } {
  const chipUsed = roundTL(Math.min(finalFare, Math.max(0, availableChip)));
  const cardCharged = roundTL(finalFare - chipUsed);
  return { chipUsed, cardCharged };
}
