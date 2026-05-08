import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const rides = await db.ride.findMany({
    select: { requestedAt: true, finalFare: true, status: true },
  });

  // 0..23 saat bucket
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}:00`,
    rides: 0,
    revenue: 0,
  }));

  for (const r of rides) {
    const h = r.requestedAt.getHours();
    buckets[h].rides += 1;
    if (r.status === 'COMPLETED' && r.finalFare !== null) {
      buckets[h].revenue += r.finalFare;
    }
  }

  return NextResponse.json({
    data: buckets.map((b) => ({
      ...b,
      revenue: Math.round(b.revenue * 100) / 100,
    })),
  });
}
