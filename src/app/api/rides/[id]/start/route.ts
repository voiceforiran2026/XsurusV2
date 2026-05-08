import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const ride = await db.ride.findUnique({ where: { id: params.id } });
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  if (ride.driverId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }
  if (!['ACCEPTED', 'EN_ROUTE_TO_PICKUP'].includes(ride.status)) {
    return NextResponse.json(
      { error: 'Yolculuk başlatılamaz (durum uygun değil)' },
      { status: 409 },
    );
  }

  const updated = await db.ride.update({
    where: { id: params.id },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  });
  return NextResponse.json({ ride: updated });
}
