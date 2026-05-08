import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const rides = await db.ride.findMany({
    where: {
      status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
    },
    select: {
      id: true,
      status: true,
      serviceType: true,
      pickupAddress: true,
      pickupLat: true,
      pickupLng: true,
      dropoffAddress: true,
      dropoffLat: true,
      dropoffLng: true,
      distanceKm: true,
      estimatedFare: true,
      requestedAt: true,
      driverLat: true,
      driverLng: true,
      rider: { select: { fullName: true } },
      driver: { select: { fullName: true, driverProfile: { select: { vehicleModel: true, plateNumber: true } } } },
    },
    orderBy: { requestedAt: 'desc' },
    take: 100,
  });

  // Online sürücüler (atanmamış olsa bile haritada gösterelim)
  const onlineDrivers = await db.driverProfile.findMany({
    where: { isOnline: true, currentLat: { not: null }, currentLng: { not: null } },
    select: {
      userId: true,
      currentLat: true,
      currentLng: true,
      vehicleModel: true,
      plateNumber: true,
      rating: true,
      user: { select: { fullName: true } },
    },
    take: 50,
  });

  return NextResponse.json({ rides, onlineDrivers });
}
