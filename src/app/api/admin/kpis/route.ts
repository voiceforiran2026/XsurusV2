import { NextResponse } from 'next/server';
import { startOfDay } from 'date-fns';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const todayStart = startOfDay(new Date());

  const [
    activeOnlineDrivers,
    todayRides,
    inflowAgg,
    payoutAgg,
    chipAgg,
    commissionAgg,
    riders,
    drivers,
    activeRides,
  ] = await Promise.all([
    db.driverProfile.count({ where: { isOnline: true } }),
    db.ride.count({ where: { requestedAt: { gte: todayStart } } }),
    db.poolLedger.aggregate({ where: { type: 'RIDE_INFLOW' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'DRIVER_PAYOUT' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'CHIP_RESERVE' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'COMMISSION' }, _sum: { amount: true } }),
    db.user.count({ where: { role: 'RIDER' } }),
    db.user.count({ where: { role: 'DRIVER' } }),
    db.ride.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
      },
    }),
  ]);

  const inflow = inflowAgg._sum.amount ?? 0;
  const payout = payoutAgg._sum.amount ?? 0;
  const chipReserve = chipAgg._sum.amount ?? 0;
  const commission = commissionAgg._sum.amount ?? 0;

  return NextResponse.json({
    activeOnlineDrivers,
    activeRides,
    todayRides,
    totalRevenue: inflow,
    driverPayout: payout,
    chipDistributed: chipReserve,
    netSystem: commission,
    totalRiders: riders,
    totalDrivers: drivers,
  });
}
