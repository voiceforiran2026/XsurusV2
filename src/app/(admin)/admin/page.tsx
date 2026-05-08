import {
  Activity,
  Car,
  Map as MapIcon,
  TrendingUp,
  Wallet,
  Users,
  PiggyBank,
  Sparkles,
  Banknote,
} from 'lucide-react';
import { startOfDay } from 'date-fns';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { KpiCard } from '@/components/admin/KpiCard';
import {
  ActiveDriversCard,
  type ActiveDriverRow,
} from '@/components/admin/ActiveDriversCard';
import { PoolHealthCard } from '@/components/admin/PoolHealthCard';
import {
  MonthlyTrendChart,
  ComparisonLineChart,
  HourlyDistributionChart,
  RevenueDonut,
} from '@/components/admin/charts/lazy';

async function getKpis() {
  const todayStart = startOfDay(new Date());
  const [
    activeOnlineDrivers,
    activeRides,
    todayRides,
    inflow,
    payout,
    chip,
    commission,
    riders,
    drivers,
    driverAgg,
  ] = await Promise.all([
    db.driverProfile.count({ where: { isOnline: true } }),
    db.ride.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'IN_PROGRESS'] },
      },
    }),
    db.ride.count({ where: { requestedAt: { gte: todayStart } } }),
    db.poolLedger.aggregate({ where: { type: 'RIDE_INFLOW' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'DRIVER_PAYOUT' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'CHIP_RESERVE' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'COMMISSION' }, _sum: { amount: true } }),
    db.user.count({ where: { role: 'RIDER' } }),
    db.user.count({ where: { role: 'DRIVER' } }),
    db.driverProfile.aggregate({
      _sum: { unpaidBalance: true, paidBalance: true },
    }),
  ]);
  return {
    activeOnlineDrivers,
    activeRides,
    todayRides,
    totalRevenue: inflow._sum.amount ?? 0,
    driverPayout: payout._sum.amount ?? 0,
    chipDistributed: chip._sum.amount ?? 0,
    netSystem: commission._sum.amount ?? 0,
    totalRiders: riders,
    totalDrivers: drivers,
    driverUnpaid: driverAgg._sum.unpaidBalance ?? 0,
    driverPaid: driverAgg._sum.paidBalance ?? 0,
  };
}

async function getMonthlyData() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const rides = await db.ride.findMany({
    where: { requestedAt: { gte: since } },
    select: { requestedAt: true, finalFare: true, status: true, riderId: true },
  });
  const buckets = new Map<
    string,
    { date: string; label: string; revenue: number; rides: number; riders: Set<string> }
  >();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - 29 + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    buckets.set(key, { date: key, label, revenue: 0, rides: 0, riders: new Set() });
  }
  for (const r of rides) {
    const key = r.requestedAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    b.rides++;
    b.riders.add(r.riderId);
    if (r.status === 'COMPLETED' && r.finalFare !== null) b.revenue += r.finalFare;
  }
  return Array.from(buckets.values()).map((b) => ({
    date: b.date,
    label: b.label,
    revenue: Math.round(b.revenue * 100) / 100,
    rides: b.rides,
    activeRiders: b.riders.size,
  }));
}

async function getHourlyData() {
  const rides = await db.ride.findMany({
    select: { requestedAt: true, finalFare: true, status: true },
  });
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}:00`,
    rides: 0,
    revenue: 0,
  }));
  for (const r of rides) {
    const h = r.requestedAt.getHours();
    buckets[h].rides++;
    if (r.status === 'COMPLETED' && r.finalFare !== null) buckets[h].revenue += r.finalFare;
  }
  return buckets.map((b) => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }));
}

async function getDistributionData() {
  const [payout, chip, commission] = await Promise.all([
    db.poolLedger.aggregate({ where: { type: 'DRIVER_PAYOUT' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'CHIP_RESERVE' }, _sum: { amount: true } }),
    db.poolLedger.aggregate({ where: { type: 'COMMISSION' }, _sum: { amount: true } }),
  ]);
  return [
    { key: 'driver', label: 'Sürücü Hak Edişi', value: Math.round((payout._sum.amount ?? 0) * 100) / 100 },
    { key: 'commission', label: 'Sistem Komisyonu', value: Math.round((commission._sum.amount ?? 0) * 100) / 100 },
    { key: 'chip', label: 'Yolcuya Chip', value: Math.round((chip._sum.amount ?? 0) * 100) / 100 },
  ];
}

async function getActiveDrivers(): Promise<ActiveDriverRow[]> {
  const rows = await db.driverProfile.findMany({
    where: { isOnline: true },
    select: {
      userId: true,
      vehicleModel: true,
      plateNumber: true,
      rating: true,
      unpaidBalance: true,
      totalRides: true,
      user: { select: { fullName: true } },
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 6,
  });
  return rows.map((r) => ({
    userId: r.userId,
    fullName: r.user.fullName,
    vehicleModel: r.vehicleModel,
    plateNumber: r.plateNumber,
    rating: r.rating,
    unpaidBalance: r.unpaidBalance,
    totalRides: r.totalRides,
  }));
}

export default async function AdminDashboardPage() {
  const user = (await getCurrentUser())!;

  const [kpis, monthly, hourly, dist, activeDrivers] = await Promise.all([
    getKpis(),
    getMonthlyData(),
    getHourlyData(),
    getDistributionData(),
    getActiveDrivers(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Süper Admin</p>
          <h1 className="heading-display text-3xl font-bold">
            Hoş geldin, {user.fullName.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Son 30 günde sistemi tek bakışta gör — gelir, yolculuk, kullanıcı
            aktivitesi ve havuz dağılımı.
          </p>
        </div>
        <LiveStatusStrip
          activeOnlineDrivers={kpis.activeOnlineDrivers}
          activeRides={kpis.activeRides}
          todayRides={kpis.todayRides}
        />
      </div>

      {/* Hero KPI — 4 kritik metrik (highlight + büyük) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Toplam Gelir"
          value={kpis.totalRevenue}
          format="tl"
          hint="Tüm zamanlar"
          highlight
        />
        <KpiCard
          icon={<Banknote className="h-4 w-4" />}
          label="Net Sistem Komisyonu"
          value={kpis.netSystem}
          format="tl"
          hint="%15 net pay"
        />
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Bekleyen Sürücü Ödemesi"
          value={kpis.driverUnpaid}
          format="tl"
          hint={`${formatTLShort(kpis.driverPaid)} ödendi`}
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Çevrimiçi Sürücü"
          value={kpis.activeOnlineDrivers}
          hint={`${kpis.activeRides} aktif yolculuk`}
        />
      </div>

      {/* Secondary KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={<MapIcon className="h-4 w-4" />}
          label="Bugünkü Yolculuk"
          value={kpis.todayRides}
        />
        <KpiCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Yolcuya Chip"
          value={kpis.chipDistributed}
          format="tl"
          hint="%10 kazanım"
        />
        <KpiCard
          icon={<PiggyBank className="h-4 w-4" />}
          label="Sürücülere Pay"
          value={kpis.driverPayout}
          format="tl"
          hint="%75 hak ediş"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Yolcu Sayısı"
          value={kpis.totalRiders}
        />
        <KpiCard
          icon={<Car className="h-4 w-4" />}
          label="Sürücü Sayısı"
          value={kpis.totalDrivers}
        />
      </div>

      {/* Operasyonel: Aktif sürücüler + Komisyon dağılımı */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActiveDriversCard
            drivers={activeDrivers}
            totalOnline={kpis.activeOnlineDrivers}
            totalDrivers={kpis.totalDrivers}
          />
        </div>
        <PoolHealthCard
          data={{
            totalInflow: kpis.totalRevenue,
            driverPayoutTotal: kpis.driverPayout,
            systemCommissionTotal: kpis.netSystem,
            chipReserveTotal: kpis.chipDistributed,
            driverUnpaid: kpis.driverUnpaid,
            driverPaid: kpis.driverPaid,
          }}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyTrendChart data={monthly} />
        </div>
        <RevenueDonut data={dist} />
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <HourlyDistributionChart data={hourly} />
        <ComparisonLineChart data={monthly} />
      </div>
    </div>
  );
}

function LiveStatusStrip({
  activeOnlineDrivers,
  activeRides,
  todayRides,
}: {
  activeOnlineDrivers: number;
  activeRides: number;
  todayRides: number;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border bg-card px-4 py-2.5 shadow-soft">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <div className="flex items-center gap-4 text-xs">
        <span>
          <span className="font-bold tabular-nums">{activeOnlineDrivers}</span>{' '}
          <span className="text-muted-foreground">çevrimiçi</span>
        </span>
        <span className="h-3 w-px bg-border" />
        <span>
          <span className="font-bold tabular-nums">{activeRides}</span>{' '}
          <span className="text-muted-foreground">aktif</span>
        </span>
        <span className="h-3 w-px bg-border" />
        <span>
          <span className="font-bold tabular-nums">{todayRides}</span>{' '}
          <span className="text-muted-foreground">bugün</span>
        </span>
      </div>
    </div>
  );
}

// Header tooltip için kompakt TL — formatTL'ye benzer ama küçük rakam için
// "k" / "M" kısaltması kullanır.
function formatTLShort(amount: number): string {
  if (amount >= 1_000_000) return `₺${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₺${(amount / 1_000).toFixed(0)}k`;
  return `₺${Math.round(amount)}`;
}
