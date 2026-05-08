import type { Metadata } from 'next';
import { Star, Car, Activity, Power } from 'lucide-react';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { formatTL } from '@/lib/format';

export const metadata: Metadata = { title: 'Sürücüler' };

export default async function AdminSuruculerPage() {
  const drivers = await db.user.findMany({
    where: { role: 'DRIVER' },
    include: { driverProfile: true },
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Sürücüler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {drivers.length} kayıtlı sürücü, {drivers.filter((d) => d.driverProfile?.isOnline).length} çevrimiçi
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <Th>Sürücü</Th>
                <Th>Araç</Th>
                <Th>Plaka</Th>
                <Th className="text-right">Puan</Th>
                <Th className="text-right">Yolculuk</Th>
                <Th className="text-right">Toplam Kazanç</Th>
                <Th className="text-right">Bekleyen</Th>
                <Th>Durum</Th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const p = d.driverProfile;
                return (
                  <tr key={d.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                          {d.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{d.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Car className="h-3 w-3 text-muted-foreground" />
                        {p?.vehicleModel ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{p?.plateNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {p?.rating.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p?.totalRides ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {formatTL(p?.totalEarnings ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatTL(p?.unpaidBalance ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      {p?.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                          <Activity className="h-2.5 w-2.5" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                          <Power className="h-2.5 w-2.5" />
                          Offline
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className ?? ''}`}>
      {children}
    </th>
  );
}
