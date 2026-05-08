import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { DriverShell } from '@/components/layout/DriverShell';
import { DriverHome } from '@/components/driver/DriverHome';

export default async function SurucuHomePage() {
  const user = (await getCurrentUser())!;

  // Aktif yolculuk varsa /surucu/aktif'e yönlendir
  const active = await db.ride.findFirst({
    where: {
      driverId: user.id,
      status: { in: ['ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
    },
    select: { id: true },
  });
  if (active) redirect(`/surucu/aktif?ride=${active.id}`);

  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
  });
  const firstName = user.fullName.split(' ')[0];

  return (
    <DriverShell>
      <div className="px-5 py-4 space-y-4 max-w-md mx-auto">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Sürücü paneli</p>
          <h1 className="text-xl font-bold">{firstName}</h1>
          {profile && (
            <p className="text-xs text-muted-foreground">
              {profile.vehicleModel} · {profile.plateNumber}
            </p>
          )}
        </div>

        <DriverHome />
      </div>
    </DriverShell>
  );
}
