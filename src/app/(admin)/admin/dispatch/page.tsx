import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { DispatchPanel } from '@/components/admin/DispatchPanel';

export const metadata: Metadata = { title: 'Mission Control · Dispatch' };

export default async function AdminDispatchPage() {
  const [rides, onlineDrivers] = await Promise.all([
    db.ride.findMany({
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
        driver: {
          select: {
            fullName: true,
            driverProfile: { select: { vehicleModel: true, plateNumber: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: 100,
    }),
    db.driverProfile.findMany({
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
    }),
  ]);

  // ISO string'e çevir client'a serialize edilebilsin diye
  const serialized = rides.map((r) => ({
    ...r,
    requestedAt: r.requestedAt.toISOString(),
    status: r.status as 'PENDING' | 'ACCEPTED' | 'EN_ROUTE_TO_PICKUP' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Mission Control</p>
        <h1 className="heading-display text-3xl font-bold">Dispatch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tüm aktif yolculukları haritada gerçek zamanlı takip et.
        </p>
      </div>

      <DispatchPanel initial={{ rides: serialized, onlineDrivers }} />
    </div>
  );
}
