import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { calculateFare } from '@/lib/pricing';
import { estimateRoadDistanceKm } from '@/lib/geo';
import { SERVICE_TYPES, PAYMENT_METHODS, type ServiceType } from '@/types/domain';

const schema = z.object({
  serviceType: z.enum(SERVICE_TYPES),
  paymentMethod: z.enum(PAYMENT_METHODS).default('CARD'),
  pickup: z.object({
    lat: z.number().finite(),
    lng: z.number().finite(),
    address: z.string().min(1),
  }),
  dropoff: z.object({
    lat: z.number().finite(),
    lng: z.number().finite(),
    address: z.string().min(1),
  }),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'RIDER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik bilgi', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { serviceType, paymentMethod, pickup, dropoff } = parsed.data;

  // Yolcunun zaten aktif (PENDING/ACCEPTED/IN_PROGRESS) talebi varsa engelle
  const active = await db.ride.findFirst({
    where: {
      riderId: user.id,
      status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
    },
  });
  if (active) {
    return NextResponse.json(
      { error: 'Zaten aktif bir yolculuğunuz var.', activeRideId: active.id },
      { status: 409 },
    );
  }

  const distanceKm = estimateRoadDistanceKm(pickup, dropoff);
  const estimatedFare = calculateFare(serviceType as ServiceType, distanceKm);

  const ride = await db.ride.create({
    data: {
      serviceType,
      status: 'PENDING',
      riderId: user.id,
      pickupAddress: pickup.address,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      dropoffAddress: dropoff.address,
      dropoffLat: dropoff.lat,
      dropoffLng: dropoff.lng,
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedFare,
      paymentMethod,
    },
  });

  return NextResponse.json({ ride }, { status: 201 });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(50, Number(url.searchParams.get('limit') ?? 20));

  const where =
    user.role === 'ADMIN'
      ? {}
      : user.role === 'DRIVER'
        ? { driverId: user.id }
        : { riderId: user.id };

  const rides = await db.ride.findMany({
    where: status ? { ...where, status } : where,
    orderBy: { requestedAt: 'desc' },
    take: limit,
    include: {
      rider: { select: { id: true, fullName: true } },
      driver: { select: { id: true, fullName: true } },
    },
  });

  return NextResponse.json({ rides });
}
