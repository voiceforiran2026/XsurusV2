'use client';

import * as React from 'react';
import { Activity, Car, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DispatchMap } from '@/components/admin/DispatchMap';
import type { DispatchRide, DispatchDriver } from '@/components/admin/DispatchMapInternal';
import { useBroadcastEvent } from '@/hooks/useBroadcastEvent';
import { isBroadcastSupported } from '@/lib/broadcast';
import { formatDistance, formatTL, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

const POLL_MS = 4000;

const STATUS_LABELS: Record<DispatchRide['status'], string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Onaylandı',
  EN_ROUTE_TO_PICKUP: 'Yolda',
  IN_PROGRESS: 'Sürüyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const STATUS_DOT: Record<DispatchRide['status'], string> = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  EN_ROUTE_TO_PICKUP: 'bg-blue-500',
  IN_PROGRESS: 'bg-emerald-500',
  COMPLETED: 'bg-muted-foreground',
  CANCELLED: 'bg-destructive',
};

interface DispatchData {
  rides: Array<DispatchRide & {
    serviceType: string;
    pickupAddress: string;
    dropoffAddress: string;
    distanceKm: number;
    estimatedFare: number;
    requestedAt: string;
    rider: { fullName: string };
    driver: { fullName: string; driverProfile: { vehicleModel: string; plateNumber: string } | null } | null;
  }>;
  onlineDrivers: DispatchDriver[];
}

interface DispatchPanelProps {
  initial: DispatchData;
}

export function DispatchPanel({ initial }: DispatchPanelProps) {
  const [data, setData] = React.useState(initial);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const res = await fetch('/api/admin/dispatch', { cache: 'no-store' });
    if (res.ok) {
      const fresh = await res.json();
      setData(fresh);
    }
  }, []);

  useBroadcastEvent(
    (e) => {
      if (
        e.type === 'ride:new' ||
        e.type === 'ride:accepted' ||
        e.type === 'ride:started' ||
        e.type === 'ride:completed' ||
        e.type === 'ride:cancelled' ||
        e.type === 'driver:online'
      ) {
        void refresh();
      }
      if (e.type === 'ride:driver_position') {
        setData((d) => ({
          ...d,
          rides: d.rides.map((r) =>
            r.id === e.rideId ? { ...r, driverLat: e.lat, driverLng: e.lng } : r,
          ),
        }));
      }
    },
    [refresh],
  );

  React.useEffect(() => {
    if (isBroadcastSupported()) return;
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const selected = data.rides.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-180px)] min-h-[560px]">
      {/* Harita */}
      <div className="h-full">
        <DispatchMap
          rides={data.rides}
          drivers={data.onlineDrivers}
          onSelect={setSelectedId}
          selectedRideId={selectedId}
        />
      </div>

      {/* Yan panel: aktif yolculuklar listesi + seçili detay */}
      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Aktif Yolculuklar
            <span className="inline-flex items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold px-1.5 h-5 min-w-5">
              {data.rides.length}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {data.onlineDrivers.length} sürücü online
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {data.rides.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Aktif yolculuk yok
            </div>
          ) : (
            data.rides.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  'w-full text-left p-3 hover:bg-muted/40 transition-colors',
                  selectedId === r.id && 'bg-muted/60',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[r.status])} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {STATUS_LABELS[r.status]}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {formatRelative(r.requestedAt)}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {r.rider.fullName} → {r.driver?.fullName ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.pickupAddress.split(',')[0]} → {r.dropoffAddress.split(',')[0]}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {formatDistance(r.distanceKm)}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatTL(r.estimatedFare)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="border-t p-4 bg-muted/30 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Car className="h-3.5 w-3.5" />
              <span className="font-semibold">
                {selected.driver?.driverProfile?.vehicleModel ?? 'Atama bekleniyor'}
              </span>
              {selected.driver?.driverProfile && (
                <span className="ml-auto font-mono text-muted-foreground">
                  {selected.driver.driverProfile.plateNumber}
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-foreground mt-0.5 shrink-0" />
                <span className="truncate">{selected.pickupAddress}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                <span className="truncate">{selected.dropoffAddress}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t">
              <span className="text-muted-foreground">Ücret</span>
              <span className="font-bold tabular-nums">{formatTL(selected.estimatedFare)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              ID · <span className="font-mono">{selected.id.slice(0, 8)}…</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
