import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const [payoutAgg, chipAgg, commissionAgg] = await Promise.all([
    db.poolLedger.aggregate({
      where: { type: 'DRIVER_PAYOUT' },
      _sum: { amount: true },
    }),
    db.poolLedger.aggregate({
      where: { type: 'CHIP_RESERVE' },
      _sum: { amount: true },
    }),
    db.poolLedger.aggregate({
      where: { type: 'COMMISSION' },
      _sum: { amount: true },
    }),
  ]);

  const data = [
    {
      key: 'driver',
      label: 'Sürücü Hak Edişi',
      value: Math.round((payoutAgg._sum.amount ?? 0) * 100) / 100,
    },
    {
      key: 'commission',
      label: 'Sistem Komisyonu',
      value: Math.round((commissionAgg._sum.amount ?? 0) * 100) / 100,
    },
    {
      key: 'chip',
      label: 'Yolcuya Chip',
      value: Math.round((chipAgg._sum.amount ?? 0) * 100) / 100,
    },
  ];

  return NextResponse.json({ data });
}
