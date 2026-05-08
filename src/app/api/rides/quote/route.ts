import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateFare } from '@/lib/pricing';
import { estimateRoadDistanceKm } from '@/lib/geo';
import { SERVICE_TYPES, type ServiceType } from '@/types/domain';

const schema = z.object({
  serviceType: z.enum(SERVICE_TYPES),
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

  const { serviceType, pickup, dropoff } = parsed.data;
  const distanceKm = estimateRoadDistanceKm(pickup, dropoff);
  const estimatedFare = calculateFare(serviceType as ServiceType, distanceKm);

  return NextResponse.json({
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedFare,
    eta: Math.max(2, Math.round(distanceKm * 2.5)), // dk, kabaca tahmini varış
  });
}
