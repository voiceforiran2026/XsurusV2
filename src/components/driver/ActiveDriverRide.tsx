'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Flag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveMapClient } from '@/components/ride/LiveMapClient';
import { FullscreenMapDialog } from '@/components/ride/FullscreenMapDialog';
import type { LiveMapPhase } from '@/components/ride/LiveMap';
import { RideStatusFlow } from '@/components/ride/RideStatusFlow';
import { RideChatDrawer } from '@/components/ride/RideChatDrawer';
import { useBroadcastEvent } from '@/hooks/useBroadcastEvent';
import { broadcast, isBroadcastSupported } from '@/lib/broadcast';
import { useAuthStore } from '@/stores/useAuthStore';
import { MessageSquare } from 'lucide-react';
import {
  startSimulator,
  makeState,
  randomStartNear,
  type SimulatorHandle,
} from '@/lib/driverSimulator';
import { haversineKm } from '@/lib/geo';
import { formatTL, formatDistance } from '@/lib/format';
import { settleRide } from '@/lib/pricing';
import type { RideStatus, ServiceType } from '@/types/domain';

export interface DriverRideDetail {
  id: string;
  status: RideStatus;
  serviceType: ServiceType;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  estimatedFare: number;
  finalFare: number | null;
  rider: {
    fullName: string;
    phone: string | null;
  };
}

const POLL_MS = 3000;

export function ActiveDriverRide({ initial }: { initial: DriverRideDetail }) {
  const router = useRouter();
  const [ride, setRide] = React.useState<DriverRideDetail>(initial);
  const [pending, setPending] = React.useState<null | 'start' | 'complete' | 'cancel'>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [authErrored, setAuthErrored] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const [driverPos, setDriverPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
  const simulatorRef = React.useRef<SimulatorHandle | null>(null);
  const transitionFiredRef = React.useRef<{ start?: boolean; complete?: boolean }>({});

  const refresh = React.useCallback(async () => {
    if (authErrored) return;
    try {
      const res = await fetch(`/api/rides/${initial.id}`, {
        cache: 'no-store',
      });
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setAuthErrored(true);
        return;
      }
      if (!res.ok) return;
      const { ride: fresh } = await res.json();
      setRide(fresh);
    } catch {}
  }, [initial.id, authErrored]);

  React.useEffect(() => {
    if (authErrored) {
      const t = setTimeout(() => router.replace('/surucu'), 200);
      return () => clearTimeout(t);
    }
  }, [authErrored, router]);

  // Polling sadece BroadcastChannel yoksa.
  React.useEffect(() => {
    if (
      authErrored ||
      ride.status === 'COMPLETED' ||
      ride.status === 'CANCELLED' ||
      isBroadcastSupported()
    )
      return;
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [ride.status, refresh, authErrored]);

  useBroadcastEvent(
    (e) => {
      if (e.type === 'ride:driver_position' && e.rideId === ride.id) return; // kendi yaydığımız
      if ('rideId' in e && e.rideId === ride.id) void refresh();
    },
    [ride.id],
  );

  // Live driver simulator: ACCEPTED ise pickup'a, IN_PROGRESS ise dropoff'a hareket.
  // Hedefe < 100m kalınca otomatik status transition tetikle.
  React.useEffect(() => {
    simulatorRef.current?.stop();
    simulatorRef.current = null;
    transitionFiredRef.current = {};

    const isToPickup = ride.status === 'ACCEPTED' || ride.status === 'EN_ROUTE_TO_PICKUP';
    const isToDropoff = ride.status === 'IN_PROGRESS';
    if (!isToPickup && !isToDropoff) return;

    const target = isToPickup
      ? { lat: ride.pickupLat, lng: ride.pickupLng }
      : { lat: ride.dropoffLat, lng: ride.dropoffLng };

    const start = isToPickup
      ? randomStartNear(target, 1.8)
      : { lat: ride.pickupLat, lng: ride.pickupLng };

    const state = makeState(start, target);
    setDriverPos(state.current);
    setDistanceKm(state.distanceRemaining);

    simulatorRef.current = startSimulator(
      state,
      ({ position, distanceRemaining, reached }) => {
        setDriverPos(position);
        setDistanceKm(distanceRemaining);
        broadcast({
          type: 'ride:driver_position',
          rideId: ride.id,
          lat: position.lat,
          lng: position.lng,
          t: Date.now(),
        });
        if (reached) {
          if (isToPickup && !transitionFiredRef.current.start) {
            transitionFiredRef.current.start = true;
            // Pickup'a vardı → IN_PROGRESS'e geçiş tetikle (sürücü manuel "Başlat" da yapabilir)
            // Demo: otomatik fire etmek yerine kullanıcı butona basabilsin diye sadece dur.
          } else if (isToDropoff && !transitionFiredRef.current.complete) {
            transitionFiredRef.current.complete = true;
            // Dropoff'a vardı → otomatik tamamla
            void fetch(`/api/rides/${ride.id}/complete`, { method: 'POST' }).then((res) => {
              if (res.ok) {
                broadcast({ type: 'ride:completed', rideId: ride.id, chipReward: 0 });
                void refresh();
              }
            });
          }
        }
      },
      { stepKm: 0.05, intervalMs: 1000 },
    );

    return () => {
      simulatorRef.current?.stop();
      simulatorRef.current = null;
    };
  }, [
    ride.id,
    ride.status,
    ride.pickupLat,
    ride.pickupLng,
    ride.dropoffLat,
    ride.dropoffLng,
    refresh,
  ]);

  React.useEffect(() => {
    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      const t = setTimeout(() => router.push('/surucu'), 1100);
      return () => clearTimeout(t);
    }
  }, [ride.status, router]);

  const action = async (
    kind: 'start' | 'complete' | 'cancel',
  ): Promise<void> => {
    setError(null);
    setPending(kind);
    try {
      const path =
        kind === 'start'
          ? 'start'
          : kind === 'complete'
            ? 'complete'
            : 'cancel';
      const res = await fetch(`/api/rides/${ride.id}/${path}`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'İşlem başarısız');
        return;
      }
      // Yolcu sekmesine bildir
      if (kind === 'start') {
        broadcast({ type: 'ride:started', rideId: ride.id });
      } else if (kind === 'complete') {
        broadcast({
          type: 'ride:completed',
          rideId: ride.id,
          chipReward: data.ride?.chipReward ?? 0,
        });
      } else {
        broadcast({ type: 'ride:cancelled', rideId: ride.id });
      }
      // State'i mutation cevabıyla değil refresh ile güncelle —
      // mutation cevabı rider/driver ilişkilerini içermiyor.
      await refresh();
    } finally {
      setPending(null);
    }
  };

  const earningPreview = settleRide(
    ride.finalFare ?? ride.estimatedFare,
  ).driverEarning;

  const mapPhase: LiveMapPhase =
    ride.status === 'ACCEPTED' || ride.status === 'EN_ROUTE_TO_PICKUP'
      ? 'to_pickup'
      : ride.status === 'IN_PROGRESS'
        ? 'in_progress'
        : ride.status === 'COMPLETED'
          ? 'completed'
          : 'planned';

  return (
    <div className="space-y-4">
      <div className="relative">
        <LiveMapClient
          pickup={{
            address: ride.pickupAddress,
            lat: ride.pickupLat,
            lng: ride.pickupLng,
          }}
          dropoff={{
            address: ride.dropoffAddress,
            lat: ride.dropoffLat,
            lng: ride.dropoffLng,
          }}
          driver={driverPos}
          phase={mapPhase}
          className="aspect-[4/3] sm:aspect-square"
        />
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label="Haritayı tam ekran aç"
          className="absolute top-3 right-3 z-[400] inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/95 backdrop-blur border shadow-soft hover:bg-background transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {driverPos && distanceKm !== null && (
        <div className="rounded-xl border bg-card px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {ride.status === 'IN_PROGRESS' ? 'Varış' : 'Yolcuya'} mesafesi
          </span>
          <span className="font-bold tabular-nums">
            {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(2)} km`}
          </span>
        </div>
      )}

      <Card className="p-5">
        <RideStatusFlow status={ride.status} perspective="driver" />
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-bold">
            {(ride.rider?.fullName ?? '?')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {ride.rider?.fullName ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {ride.serviceType === 'GO' ? 'Gönderi' : 'Yolculuk'}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted transition-colors"
              aria-label="Yolcuya mesaj"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            {ride.rider?.phone && (
              <a
                href={`tel:${ride.rider.phone}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted transition-colors"
                aria-label="Yolcuyu ara"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t pt-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background mt-0.5">
              <MapPin className="h-3 w-3" />
            </div>
            <p className="text-sm flex-1 min-w-0 truncate">
              {ride.pickupAddress}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
            </div>
            <p className="text-sm flex-1 min-w-0 truncate">
              {ride.dropoffAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Mesafe
            </p>
            <p className="text-sm font-medium">
              {formatDistance(ride.distanceKm)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {ride.status === 'COMPLETED' ? 'Kazanç' : 'Tahmini kazanç'}
            </p>
            <p className="text-base font-bold">{formatTL(earningPreview)}</p>
          </div>
        </div>
      </Card>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Aksiyon butonları durum bağımlı */}
      {ride.status === 'ACCEPTED' || ride.status === 'EN_ROUTE_TO_PICKUP' ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            size="lg"
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => action('cancel')}
            disabled={!!pending}
          >
            İptal Et
          </Button>
          <Button
            size="lg"
            onClick={() => action('start')}
            disabled={!!pending}
          >
            {pending === 'start' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            Yolculuğu Başlat
          </Button>
        </div>
      ) : ride.status === 'IN_PROGRESS' ? (
        <Button
          size="lg"
          className="w-full"
          onClick={() => action('complete')}
          disabled={!!pending}
        >
          {pending === 'complete' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Yolculuğu Bitir
        </Button>
      ) : ride.status === 'COMPLETED' ? (
        <Card className="p-5 bg-canvas text-white border-canvas text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-semibold">Yolculuk tamamlandı</p>
          <p className="text-xs text-white/70 mt-1">
            Birazdan ana ekrana yönlendirileceksiniz.
          </p>
        </Card>
      ) : ride.status === 'CANCELLED' ? (
        <Card className="p-5 bg-muted text-center">
          <p className="font-semibold text-sm">Yolculuk iptal edildi</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ana ekrana dönülüyor…
          </p>
        </Card>
      ) : null}

      {currentUserId && (
        <RideChatDrawer
          rideId={ride.id}
          currentUserId={currentUserId}
          otherUserName={ride.rider?.fullName}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}

      <FullscreenMapDialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        pickup={{
          address: ride.pickupAddress,
          lat: ride.pickupLat,
          lng: ride.pickupLng,
        }}
        dropoff={{
          address: ride.dropoffAddress,
          lat: ride.dropoffLat,
          lng: ride.dropoffLng,
        }}
        driver={driverPos}
        phase={mapPhase}
        liveDistanceKm={distanceKm}
      />
    </div>
  );
}
