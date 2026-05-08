import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const limit = Math.min(50, Number(url.searchParams.get('limit') ?? 20));
  const type = url.searchParams.get('type') ?? undefined;

  const where = type ? { type } : {};
  const [items, total] = await Promise.all([
    db.poolLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.poolLedger.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
