import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { roundTL } from '@/lib/pricing';

// Admin → tüm sürücülerin biriken (unpaid) bakiyelerini paid'e taşır.
// Her sürücü için bir PAYOUT_SETTLEMENT ledger satırı oluşturur.
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const drivers = await db.driverProfile.findMany({
    where: { unpaidBalance: { gt: 0 } },
    select: { userId: true, unpaidBalance: true },
  });

  if (drivers.length === 0) {
    return NextResponse.json({
      ok: true,
      driverCount: 0,
      totalPaid: 0,
      message: 'Bekleyen ödeme yok',
    });
  }

  const totalPaid = roundTL(
    drivers.reduce((s, d) => s + d.unpaidBalance, 0),
  );

  await db.$transaction(async (tx) => {
    for (const d of drivers) {
      const amount = roundTL(d.unpaidBalance);
      await tx.driverProfile.update({
        where: { userId: d.userId },
        data: {
          unpaidBalance: 0,
          paidBalance: { increment: amount },
        },
      });
      await tx.poolLedger.create({
        data: {
          type: 'PAYOUT_SETTLEMENT',
          amount,
          driverId: d.userId,
          description: `Toplu ödeme: ${amount} ₺`,
        },
      });
    }
  });

  return NextResponse.json({
    ok: true,
    driverCount: drivers.length,
    totalPaid,
  });
}
