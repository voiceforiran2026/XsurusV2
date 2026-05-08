import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const ride = await db.ride.findUnique({ where: { id: params.id } });
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  if (
    user.role !== 'ADMIN' &&
    ride.riderId !== user.id &&
    ride.driverId !== user.id
  ) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  // Sadece henüz başlamamış yolculuklar iptal edilebilir
  if (!['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP'].includes(ride.status)) {
    return NextResponse.json(
      { error: 'Bu yolculuk artık iptal edilemez' },
      { status: 409 },
    );
  }

  const updated = await db.ride.update({
    where: { id: params.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: user.role === 'RIDER' ? 'Yolcu tarafından iptal' : 'Sürücü tarafından iptal',
    },
  });

  return NextResponse.json({ ride: updated });
}
