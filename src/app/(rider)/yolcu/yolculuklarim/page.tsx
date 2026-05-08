import type { Metadata } from 'next';
import { History } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { db } from '@/lib/db';
import { RiderShell } from '@/components/layout/RiderShell';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { formatTL, formatDistance, formatDateTime } from '@/lib/format';

export const metadata: Metadata = { title: 'Yolculuklarım' };

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Onaylandı',
  EN_ROUTE_TO_PICKUP: 'Yolda',
  IN_PROGRESS: 'Sürüyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export default async function YolculuklarımPage() {
  const user = (await getCurrentUser())!;
  const rides = await db.ride.findMany({
    where: { riderId: user.id },
    orderBy: { requestedAt: 'desc' },
    take: 50,
    include: {
      driver: { select: { fullName: true } },
    },
  });

  return (
    <RiderShell>
      <div className="px-5 py-4 max-w-md mx-auto space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Geçmiş</p>
          <h1 className="text-xl font-bold">Yolculuklarım</h1>
        </div>

        {rides.length === 0 ? (
          <EmptyState
            icon={<History className="h-5 w-5" />}
            title="Henüz yolculuk yok"
            description="İlk yolculuğunuzu oluşturun, geçmişiniz burada görünsün."
          />
        ) : (
          <div className="space-y-2.5">
            {rides.map((r) => (
              <Card key={r.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(r.requestedAt)}
                    </p>
                    <p className="text-sm font-medium truncate mt-1">
                      {r.pickupAddress}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      → {r.dropoffAddress}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      r.status === 'COMPLETED'
                        ? 'bg-foreground text-background'
                        : r.status === 'CANCELLED'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2.5">
                  <span>
                    {formatDistance(r.distanceKm)}
                    {r.driver && ` · ${r.driver.fullName.split(' ')[0]}`}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatTL(r.finalFare ?? r.estimatedFare)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RiderShell>
  );
}
