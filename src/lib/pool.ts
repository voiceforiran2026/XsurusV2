// Para havuzu — saf hesap fonksiyonları + DB helper'ları.
//
// Havuz akışı (her tamamlanan yolculukta):
//   1. RIDE_INFLOW       (+ finalFare)
//   2. DRIVER_PAYOUT     (driverEarning — sürücünün unpaidBalance'ına eklenir)
//   3. CHIP_RESERVE      (chipReward — yolcunun chipBalance'ına eklenir)
//   4. COMMISSION        (systemCommission — net sistem geliri)
//
// Invariant: RIDE_INFLOW == DRIVER_PAYOUT + CHIP_RESERVE + COMMISSION

import { settleRide } from './pricing';
import type { LedgerType } from '@/types/domain';

export interface SettlementEntry {
  type: LedgerType;
  amount: number; // pozitif değer (havuza giriş veya çıkış miktarı)
  description: string;
}

export interface SettlementResult {
  driverEarning: number;
  systemCommission: number;
  chipReward: number;
  ledger: SettlementEntry[];
}

/**
 * Tamamlanan bir yolculuk için 4 satırlık ledger üretir.
 * Saf — yan etki yok.
 */
export function buildSettlement(
  finalFare: number,
  rideId: string,
): SettlementResult {
  const { driverEarning, systemCommission, chipReward } = settleRide(finalFare);

  const ledger: SettlementEntry[] = [
    {
      type: 'RIDE_INFLOW',
      amount: finalFare,
      description: `Yolculuk geliri #${rideId.slice(-6)}`,
    },
    {
      type: 'DRIVER_PAYOUT',
      amount: driverEarning,
      description: `Sürücü hak edişi #${rideId.slice(-6)}`,
    },
    {
      type: 'CHIP_RESERVE',
      amount: chipReward,
      description: `Chip karşılığı #${rideId.slice(-6)}`,
    },
    {
      type: 'COMMISSION',
      amount: systemCommission,
      description: `Sistem komisyonu #${rideId.slice(-6)}`,
    },
  ];

  return { driverEarning, systemCommission, chipReward, ledger };
}

export interface PoolSnapshot {
  totalInflow: number;
  totalDriverPayout: number; // sürücülere ödenmiş + biriken
  totalChipReserve: number; // yolculara verilen chip değeri
  totalCommission: number; // sistem komisyonu
  totalRedemption: number; // yolcuların chip ile ödediği
  totalDriverPaid: number; // gerçekten ödenen
  driverUnpaid: number; // havuzda bekleyen
  netSystem: number; // sistem net = commission - chip_redemption_loss + ...
}

interface LedgerLike {
  type: LedgerType;
  amount: number;
}

/**
 * Tüm ledger satırlarından havuz özetini çıkarır.
 */
export function summarizePool(entries: LedgerLike[]): PoolSnapshot {
  let inflow = 0,
    payout = 0,
    chipReserve = 0,
    commission = 0,
    redemption = 0;

  for (const e of entries) {
    switch (e.type) {
      case 'RIDE_INFLOW':
        inflow += e.amount;
        break;
      case 'DRIVER_PAYOUT':
        payout += e.amount;
        break;
      case 'CHIP_RESERVE':
        chipReserve += e.amount;
        break;
      case 'COMMISSION':
        commission += e.amount;
        break;
      case 'CHIP_REDEMPTION':
        redemption += e.amount;
        break;
    }
  }

  return {
    totalInflow: round2(inflow),
    totalDriverPayout: round2(payout),
    totalChipReserve: round2(chipReserve),
    totalCommission: round2(commission),
    totalRedemption: round2(redemption),
    totalDriverPaid: 0,
    driverUnpaid: round2(payout),
    netSystem: round2(commission),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
