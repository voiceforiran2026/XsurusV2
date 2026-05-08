import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  // ChipBalance yoksa otomatik 0'la oluştur
  const balance = await db.chipBalance.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const transactions = await db.chipTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({
    balance,
    transactions,
  });
}
