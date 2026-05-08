import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { RiderShell } from '@/components/layout/RiderShell';
import { RideRequestPanel } from '@/components/ride/RideRequestPanel';
import { MapWithRoute } from '@/components/ride/MapWithRoute';
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
        <MapWithRoute />
        <RideRequestPanel chipBalance={chip?.balance ?? 0} />
      </div>
    </RiderShell>
  );
}
