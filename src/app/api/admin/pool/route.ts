import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const [
    inflowAgg,
    payoutAgg,
    chipReserveAgg,
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

  const totalInflow = inflowAgg._sum.amount ?? 0;
  const totalDriverPayout = payoutAgg._sum.amount ?? 0;
  const totalChipReserve = chipReserveAgg._sum.amount ?? 0;
  const totalCommission = commissionAgg._sum.amount ?? 0;
  const totalSettlements = settlementAgg._sum.amount ?? 0;

  return NextResponse.json({
    totalInflow,
    totalDriverPayout,
    totalChipReserve,
    totalCommission,
    totalSettlements,
    driverUnpaid: drivers._sum.unpaidBalance ?? 0,
    driverPaid: drivers._sum.paidBalance ?? 0,
    driverTotalEarnings: drivers._sum.totalEarnings ?? 0,
    driverCount: drivers._count,
  });
}
