import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { DriverShell } from '@/components/layout/DriverShell';
import {
  ActiveDriverRide,
  type DriverRideDetail,
} from '@/components/driver/ActiveDriverRide';
import type { RideStatus, ServiceType } from '@/types/domain';

export default async function SurucuAktifPage({
  searchParams,
}: {
  searchParams: { ride?: string };
}) {
  const user = (await getCurrentUser())!;
  const id = searchParams.ride;
  if (!id) redirect('/surucu');

  const ride = await db.ride.findUnique({
    where: { id },
    include: {
      rider: { select: { fullName: true, phone: true } },
    },
  });
  if (!ride || ride.driverId !== user.id) redirect('/surucu');

  const initial: DriverRideDetail = {
    id: ride.id,
    status: ride.status as RideStatus,
    serviceType: ride.serviceType as ServiceType,
    pickupAddress: ride.pickupAddress,
    pickupLat: ride.pickupLat,
    pickupLng: ride.pickupLng,
    dropoffAddress: ride.dropoffAddress,
    dropoffLat: ride.dropoffLat,
    dropoffLng: ride.dropoffLng,
    distanceKm: ride.distanceKm,
    estimatedFare: ride.estimatedFare,
    finalFare: ride.finalFare,
    rider: ride.rider!,
  };

  return (
    <DriverShell>
      <div className="px-5 py-4 max-w-md mx-auto">
        <ActiveDriverRide initial={initial} />
      </div>
    </DriverShell>
  );
}
