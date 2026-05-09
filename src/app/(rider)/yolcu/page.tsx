import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { RiderShell } from '@/components/layout/RiderShell';
import { RideRequestPanel } from '@/components/ride/RideRequestPanel';
import { MapWithRoute } from '@/components/ride/MapWithRoute';
import { PendingRatingPrompt } from '@/components/ride/PendingRatingPrompt';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export default async function YolcuHomePage() {
  const user = (await getCurrentUser())!;

  // Aktif yolculuk varsa /yolcu/arama'ya yönlendir
  const active = await db.ride.findFirst({
    where: {
      riderId: user.id,
      status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
    },
    select: { id: true },
  });
  if (active) redirect(`/yolcu/arama?ride=${active.id}`);

  // Son tamamlanmış ama bu yolcu tarafından puanlanmamış yolculuk var mı?
  const lastCompleted = await db.ride.findFirst({
    where: {
      riderId: user.id,
      status: 'COMPLETED',
      driverId: { not: null },
    },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      completedAt: true,
      driver: { select: { fullName: true } },
    },
  });
  let pendingRating: { rideId: string; driverName: string | null } | null = null;
  if (lastCompleted) {
    const myRating = await db.rideRating.findUnique({
      where: { rideId_raterId: { rideId: lastCompleted.id, raterId: user.id } },
      select: { id: true },
    });
    // Son 24 saat içinde tamamlanmış ve puanlanmamış ise prompt göster
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const completedRecently =
      lastCompleted.completedAt &&
      lastCompleted.completedAt.getTime() > twentyFourHoursAgo;
    if (!myRating && completedRecently) {
      pendingRating = {
        rideId: lastCompleted.id,
        driverName: lastCompleted.driver?.fullName ?? null,
      };
    }
  }

  const firstName = user.fullName.split(' ')[0];
  const chip = await db.chipBalance.findUnique({
    where: { userId: user.id },
    select: { balance: true },
  });

  return (
    <RiderShell>
      <div className="px-5 py-4 space-y-4 max-w-md mx-auto">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Merhaba</p>
          <h1 className="text-xl font-bold">{firstName}, nereye?</h1>
        </div>
        {pendingRating && (
          <PendingRatingPrompt
            rideId={pendingRating.rideId}
            driverName={pendingRating.driverName}
          />
        )}
        <MapWithRoute />
        <RideRequestPanel chipBalance={chip?.balance ?? 0} />
      </div>
    </RiderShell>
  );
}
