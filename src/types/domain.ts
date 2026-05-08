// Enum-benzeri literal type'lar (SQLite Prisma'da enum desteklemediği için)

export const ROLES = ['ADMIN', 'RIDER', 'DRIVER'] as const;
export type Role = (typeof ROLES)[number];

export const SERVICE_TYPES = ['RIDE', 'GO'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const RIDE_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'EN_ROUTE_TO_PICKUP',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export const PAYMENT_METHODS = ['CARD', 'CHIP'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CHIP_TX_TYPES = [
  'EARN_FROM_RIDE',
  'SPEND_ON_RIDE',
  'ADJUSTMENT',
] as const;
export type ChipTxType = (typeof CHIP_TX_TYPES)[number];

export const LEDGER_TYPES = [
  'RIDE_INFLOW',
  'DRIVER_PAYOUT',
  'CHIP_RESERVE',
  'COMMISSION',
  'CHIP_REDEMPTION',
  'PAYOUT_SETTLEMENT', // admin → sürücüye toplu ödeme transferi (Faz 8)
] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
}
