import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { PoolVisualizer } from '@/components/admin/PoolVisualizer';

export const metadata: Metadata = { title: 'Para Havuzu' };

export default async function AdminHavuzPage() {
  const [
    inflowAgg,
    payoutAgg,
    chipAgg,
    commissionAgg,
    settlementAgg,
    drivers,
  ] = await Promise.all([
    db.poolLedger.aggregate({ where: { type: 'RIDE_INFLOW' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'DRIVER_PAYOUT' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'CHIP_RESERVE' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'COMMISSION' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'PAYOUT_SETTLEMENT' }, _sum: { amount: true } }),
    db.driverProfile.aggregate({
      _sum: { unpaidBalance: true, paidBalance: true, totalEarnings: true },
      _count: true,
    }),
  ]);

  const initial = {
    totalInflow: inflowAgg._sum.amount ?? 0,
    totalDriverPayout: payoutAgg._sum.amount ?? 0,
    totalChipReserve: chipAgg._sum.amount ?? 0,
    totalCommission: commissionAgg._sum.amount ?? 0,
    totalSettlements: settlementAgg._sum.amount ?? 0,
    driverUnpaid: drivers._sum.unpaidBalance ?? 0,
    driverPaid: drivers._sum.paidBalance ?? 0,
    driverTotalEarnings: drivers._sum.totalEarnings ?? 0,
    driverCount: drivers._count,
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Para Havuzu</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Tüm zamanların gelir/gider akışı tek ekranda. Her tamamlanan
          yolculukta havuz büyür, sürücülere ve yolculara dağılır. "Şoför
          Ödemelerini Dağıt" tıklandığında bekleyen tutarlar sürücülerin
          hesaplarına aktarılır.
        </p>
      </div>
      <PoolVisualizer initial={initial} />
    </div>
  );
}
