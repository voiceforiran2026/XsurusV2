import { NextResponse } from 'next/server';
import { startOfDay, subDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const days = 30;
  const today = startOfDay(new Date());
  const since = subDays(today, days - 1);

  // Tek query'de gelen ride'ları al, JS tarafında grupla
  const rides = await db.ride.findMany({
    where: { requestedAt: { gte: since } },
    select: {
      requestedAt: true,
      finalFare: true,
      status: true,
      riderId: true,
    },
  });

  type Bucket = {
    date: string; // ISO YYYY-MM-DD
    label: string; // "12 Şub"
    revenue: number;
    rides: number;
    riders: Set<string>;
  };

  const buckets = new Map<string, Bucket>();
  for (let i = 0; i < days; i++) {
    const d = subDays(today, days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: format(d, 'd MMM', { locale: tr }),
      revenue: 0,
      rides: 0,
      riders: new Set(),
    });
  }

  for (const r of rides) {
    const key = r.requestedAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    b.rides += 1;
    b.riders.add(r.riderId);
    if (r.status === 'COMPLETED' && r.finalFare !== null) {
      b.revenue += r.finalFare;
    }
  }

  const data = Array.from(buckets.values()).map((b) => ({
    date: b.date,
    label: b.label,
    revenue: Math.round(b.revenue * 100) / 100,
    rides: b.rides,
    activeRiders: b.riders.size,
  }));

  return NextResponse.json({ data });
}
