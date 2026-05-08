import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { RiderShell } from '@/components/layout/RiderShell';
import {
  ActiveRidePanel,
  type RideDetail,
} from '@/components/ride/ActiveRidePanel';
import type { RideStatus, ServiceType } from '@/types/domain';

export default async function YolcuAramaPage({
  searchParams,
}: {
  searchParams: { ride?: string };
}) {
  const user = (await getCurrentUser())!;
  const id = searchParams.ride;
  if (!id) redirect('/yolcu');

  const ride = await db.ride.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
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
  if (!ride || ride.riderId !== user.id) redirect('/yolcu');

  const initial: RideDetail = {
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
    chipReward: ride.chipReward,
    driver: ride.driver,
  };

  return (
    <RiderShell>
      <div className="px-5 py-4 max-w-md mx-auto">
        <ActiveRidePanel initial={initial} />
      </div>
    </RiderShell>
  );
}
