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

  // Sürücü çevrimiçi olmalı
  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile?.isOnline) {
    return NextResponse.json(
      { error: 'Önce çevrimiçi olun' },
      { status: 409 },
    );
  }

  // Sürücünün başka aktif yolculuğu varsa engelle
  const activeForDriver = await db.ride.findFirst({
    where: {
      driverId: user.id,
      status: { in: ['ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
    },
  });
  if (activeForDriver) {
    return NextResponse.json(
      { error: 'Zaten aktif bir yolculuğunuz var', activeRideId: activeForDriver.id },
      { status: 409 },
    );
  }

  // Atomic update: PENDING → ACCEPTED, sadece henüz kimse almadıysa
  const updated = await db.ride.updateMany({
    where: { id: params.id, status: 'PENDING', driverId: null },
    data: {
      status: 'ACCEPTED',
      driverId: user.id,
      acceptedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: 'Bu yolculuk artık alınamaz (başka bir sürücü almış olabilir)' },
      { status: 409 },
    );
  }

  const ride = await db.ride.findUnique({ where: { id: params.id } });
  return NextResponse.json({ ride });
}
