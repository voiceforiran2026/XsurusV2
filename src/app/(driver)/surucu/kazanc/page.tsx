import type { Metadata } from 'next';
import {
  TrendingUp,
  Clock,
  Wallet,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { db } from '@/lib/db';
import { DriverShell } from '@/components/layout/DriverShell';
import { Card } from '@/components/ui/card';
import { formatTL, formatRelative } from '@/lib/format';

export const metadata: Metadata = { title: 'Kazançlarım' };

export default async function SurucuKazancPage() {
  const user = (await getCurrentUser())!;
  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  // Tamamlanmış yolculukların kazanç toplamı (zaman aralıklı)
  const [todayAgg, weekAgg, monthAgg] = await Promise.all([
    db.ride.aggregate({
      where: {
        driverId: user.id,
        status: 'COMPLETED',
        completedAt: { gte: todayStart },
      },
      _sum: { driverEarning: true },
      _count: true,
    }),
    db.ride.aggregate({
      where: {
        driverId: user.id,
        status: 'COMPLETED',
        completedAt: { gte: weekStart },
      },
      _sum: { driverEarning: true },
      _count: true,
    }),
    db.ride.aggregate({
      where: {
        driverId: user.id,
        status: 'COMPLETED',
        completedAt: { gte: monthStart },
      },
      _sum: { driverEarning: true },
      _count: true,
    }),
  ]);

  const recent = await db.ride.findMany({
    where: { driverId: user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      completedAt: true,
      driverEarning: true,
      pickupAddress: true,
      dropoffAddress: true,
    },
  });

  return (
    <DriverShell>
      <div className="px-5 py-4 max-w-md mx-auto space-y-5">
        <div>
          <p className="text-xs text-muted-foreground">Sürücü</p>
          <h1 className="text-xl font-bold">Kazançlarım</h1>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-canvas text-white p-6 shadow-soft-lg">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1),_transparent_60%)] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
              <Wallet className="h-3 w-3" />
              Bekleyen Bakiye
            </div>
            <div className="mt-3 heading-display text-5xl font-bold tabular-nums">
              {formatTL(profile?.unpaidBalance ?? 0)}
            </div>
            <p className="text-xs text-white/60 mt-1">
              Admin "Şoför Ödemelerini Dağıt" dediğinde hesabınıza geçer.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Ödenen
                </div>
                <div className="text-base font-bold mt-1">
                  {formatTL(profile?.paidBalance ?? 0)}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  Toplam
                </div>
                <div className="text-base font-bold mt-1">
                  {formatTL(profile?.totalEarnings ?? 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
            <Calendar className="h-4 w-4" />
            Dönemsel Kazanç
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <PeriodCard
              label="Bugün"
              total={todayAgg._sum.driverEarning ?? 0}
              count={todayAgg._count}
            />
            <PeriodCard
              label="Bu Hafta"
              total={weekAgg._sum.driverEarning ?? 0}
              count={weekAgg._count}
            />
            <PeriodCard
              label="Bu Ay"
              total={monthAgg._sum.driverEarning ?? 0}
              count={monthAgg._count}
            />
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
            <Clock className="h-4 w-4" />
            Son Yolculuklar
          </h2>
          {recent.length === 0 ? (
            <Card className="p-5 text-center text-sm text-muted-foreground">
              Henüz tamamlanmış yolculuğunuz yok.
            </Card>
          ) : (
            <Card className="divide-y">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {r.pickupAddress}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      → {r.dropoffAddress}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {r.completedAt ? formatRelative(r.completedAt) : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    +{formatTL(r.driverEarning ?? 0)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>
    </DriverShell>
  );
}

function PeriodCard({
  label,
  total,
  count,
}: {
  label: string;
  total: number;
  count: number;
}) {
  return (
    <Card className="p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-base font-bold mt-1 tabular-nums">{formatTL(total)}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {count} yolculuk
      </p>
    </Card>
  );
}
