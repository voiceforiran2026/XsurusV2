import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const ride = await db.ride.findUnique({
    where: { id: params.id },
    include: {
      rider: { select: { id: true, fullName: true, phone: true } },
      driver: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          driverProfile: {
            select: {
              vehicleModel: true,
              plateNumber: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!ride) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  }

  // Yetki kontrolü: yolcu/sürücü/admin
  if (
    user.role !== 'ADMIN' &&
    ride.riderId !== user.id &&
    ride.driverId !== user.id
  ) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  return NextResponse.json({ ride });
}
