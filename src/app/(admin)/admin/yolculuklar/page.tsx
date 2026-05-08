import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { RidesTable, type AdminRideRow } from '@/components/admin/RidesTable';
import type { RideStatus, ServiceType } from '@/types/domain';

export const metadata: Metadata = { title: 'Yolculuklar' };

const PAGE_SIZE = 20;

export default async function AdminYolculuklarPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const status = searchParams.status?.trim();
  const q = searchParams.q?.trim();

  const where: {
    status?: string;
    OR?: Array<Record<string, unknown>>;
  } = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { pickupAddress: { contains: q } },
      { dropoffAddress: { contains: q } },
      { rider: { fullName: { contains: q } } },
      { driver: { fullName: { contains: q } } },
    ];
  }

  const [rides, totalCount] = await Promise.all([
    db.ride.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        rider: { select: { fullName: true } },
        driver: { select: { fullName: true } },
      },
    }),
    db.ride.count({ where }),
  ]);

  const initialRides: AdminRideRow[] = rides.map((r) => ({
    id: r.id,
    serviceType: r.serviceType as ServiceType,
    status: r.status as RideStatus,
    riderName: r.rider.fullName,
    driverName: r.driver?.fullName ?? null,
    pickupAddress: r.pickupAddress,
    dropoffAddress: r.dropoffAddress,
    distanceKm: r.distanceKm,
    finalFare: r.finalFare,
    estimatedFare: r.estimatedFare,
    driverEarning: r.driverEarning,
    systemCommission: r.systemCommission,
    chipReward: r.chipReward,
    paymentMethod: r.paymentMethod,
    requestedAt: r.requestedAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Yolculuklar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtrele, ara ve detayını incele.
        </p>
      </div>
      <RidesTable
        initialRides={initialRides}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, q }}
      />
    </div>
  );
}
