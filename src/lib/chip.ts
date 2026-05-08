// Chip cüzdan saf fonksiyonları + DB yardımcıları.
// 1 chip = 1 ₺ varsayılır.
//
// Faz 5: API ve UI entegrasyonu.
// Faz 6: yolculuk completion'unda earn entegre edilir, havuz ledger eşleşir.

import { roundTL } from './pricing';
import type { ChipTxType } from '@/types/domain';

export interface ChipBalanceSnapshot {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

/**
 * Mevcut bakiyeye verilen tutarı ekleyip yeni snapshot döner.
 * Saf — yan etki yok.
 */
export function applyEarn(
  balance: ChipBalanceSnapshot,
  amount: number,
): ChipBalanceSnapshot {
  if (!Number.isFinite(amount) || amount <= 0) return balance;
  const a = roundTL(amount);
  return {
    balance: roundTL(balance.balance + a),
    lifetimeEarned: roundTL(balance.lifetimeEarned + a),
    lifetimeSpent: balance.lifetimeSpent,
  };
}

/**
 * Bakiyeden tutar düşürür. Yetersizse, harcanabilen kısmı kullanır.
 */
export function applySpend(
  balance: ChipBalanceSnapshot,
  amount: number,
): { snapshot: ChipBalanceSnapshot; actual: number } {
  if (!Number.isFinite(amount) || amount <= 0)
    return { snapshot: balance, actual: 0 };
  const actual = roundTL(Math.min(amount, balance.balance));
  return {
    snapshot: {
      balance: roundTL(balance.balance - actual),
      lifetimeEarned: balance.lifetimeEarned,
      lifetimeSpent: roundTL(balance.lifetimeSpent + actual),
    },
    actual,
  };
}

export function txTypeLabel(t: ChipTxType): string {
  switch (t) {
    case 'EARN_FROM_RIDE':
      return 'Yolculuktan kazanım';
    case 'SPEND_ON_RIDE':
      return 'Yolculukta kullanım';
    case 'ADJUSTMENT':
      return 'Ayarlama';
  }
}
