'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, X, Star, MapPin, Maximize2, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveMapClient } from '@/components/ride/LiveMapClient';
import { FullscreenMapDialog } from '@/components/ride/FullscreenMapDialog';
import type { LiveMapPhase } from '@/components/ride/LiveMap';
import { RideStatusFlow } from '@/components/ride/RideStatusFlow';
import { RideChatDrawer } from '@/components/ride/RideChatDrawer';
import { RideRatingDialog } from '@/components/ride/RideRatingDialog';
import { ChipGainBurst } from '@/components/animations/ChipGainBurst';
import { useBroadcastEvent } from '@/hooks/useBroadcastEvent';
import { broadcast, isBroadcastSupported } from '@/lib/broadcast';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  startSimulator,
  makeState,
  randomStartNear,
  type SimulatorHandle,
} from '@/lib/driverSimulator';
import { formatTL, formatDistance } from '@/lib/format';
import type { RideStatus, ServiceType } from '@/types/domain';

export interface RideDetail {
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
  chipReward: number | null;
  driver: null | {
    fullName: string;
    phone: string | null;
    driverProfile: {
      vehicleModel: string;
      plateNumber: string;
      rating: number;
    } | null;
  };
}

const POLL_MS = 3000;

export function ActiveRidePanel({ initial }: { initial: RideDetail }) {
  const router = useRouter();
  const params = useSearchParams();
  void params;
  const [ride, setRide] = React.useState<RideDetail>(initial);
  const [showBurst, setShowBurst] = React.useState(false);
  const burstShownRef = React.useRef(false);
  const [authErrored, setAuthErrored] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [ratingOpen, setRatingOpen] = React.useState(false);
  const ratingShownRef = React.useRef(false);
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const [driverPos, setDriverPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [driverDistanceKm, setDriverDistanceKm] = React.useState<number | null>(null);
  const simulatorRef = React.useRef<SimulatorHandle | null>(null);
  const transitionFiredRef = React.useRef<{ start?: boolean; complete?: boolean }>({});

  const refresh = React.useCallback(async () => {
    if (authErrored) return; // ekstra interval/broadcast tetiklemesini engelle
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
      setRide({
        ...fresh,
        driver: fresh.driver ?? null,
      });
    } catch {
      // sessizce yut
    }
  }, [initial.id, authErrored]);

  // Yetki bozulduğunda yumuşak redirect
  React.useEffect(() => {
    if (authErrored) {
      const t = setTimeout(() => router.replace('/yolcu'), 200);
      return () => clearTimeout(t);
    }
  }, [authErrored, router]);

  // Polling — broadcast varsa hızlı yol, yoksa 3sn fallback.
  // BroadcastChannel incognito/farklı cihaz/farklı browser arasında çalışmaz,
  // o yüzden polling her zaman safety net olarak çalışır.
  React.useEffect(() => {
    if (
      authErrored ||
      ride.status === 'COMPLETED' ||
      ride.status === 'CANCELLED'
    ) {
      return;
    }
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [ride.status, refresh, authErrored]);

  // BroadcastChannel — ride lifecycle event'leri.
  // NOT: `ride:driver_position` event'lerini KASITLI olarak yok sayıyoruz çünkü
  // yolcu tarafı kendi yerel simülatörünü çalıştırıyor (aşağıda). Bu sayede
  // sürücü sekmesi açık olmasa bile yolcu, "Haritada Canlı Takip Et" butonuna
  // bastığında araba animasyonunu görür.
  useBroadcastEvent((e) => {
    if (e.type === 'ride:driver_position') return;
    if ('rideId' in e && e.rideId === ride.id) {
      void refresh();
    }
  }, [ride.id]);

  // Yolcu tarafı sürücü simülatörü.
  // - ACCEPTED / EN_ROUTE_TO_PICKUP → araba pickup'a doğru hareket eder
  // - IN_PROGRESS → araba dropoff'a doğru hareket eder
  // Konum hem fullscreen modal'da görünür hem de mesafe rozetinde kullanılır.
  // Küçük haritada (aşağıda `driver={null}`) gösterilmez — kullanıcı animasyonu
  // ancak "Haritada Canlı Takip Et" butonu ile açtığında görür.
  React.useEffect(() => {
    simulatorRef.current?.stop();
    simulatorRef.current = null;

    const isToPickup =
      ride.status === 'ACCEPTED' || ride.status === 'EN_ROUTE_TO_PICKUP';
    const isToDropoff = ride.status === 'IN_PROGRESS';

    if (!isToPickup && !isToDropoff) {
      setDriverPos(null);
      setDriverDistanceKm(null);
      return;
    }

    const target = isToPickup
      ? { lat: ride.pickupLat, lng: ride.pickupLng }
      : { lat: ride.dropoffLat, lng: ride.dropoffLng };
    const start = isToPickup
      ? randomStartNear(target, 1.8)
      : { lat: ride.pickupLat, lng: ride.pickupLng };

    const state = makeState(start, target);
    setDriverPos(state.current);
    setDriverDistanceKm(state.distanceRemaining);

    simulatorRef.current = startSimulator(
      state,
      ({ position, distanceRemaining }) => {
        setDriverPos(position);
        setDriverDistanceKm(distanceRemaining);
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
  ]);

  const cancel = async () => {
    if (!confirm('Yolculuğu iptal etmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/rides/${ride.id}/cancel`, { method: 'POST' });
    if (res.ok) {
      // Diğer sekmelere bildir (sürücü tab'ı listeyi yenilesin)
      broadcast({ type: 'ride:cancelled', rideId: ride.id });
    }
    void refresh();
  };

  // Chip burst — chipReward null'dan değere döndüğünde tetiklenir.
  React.useEffect(() => {
    if (ride.status !== 'COMPLETED') return;
    if (burstShownRef.current) return;
    if ((ride.chipReward ?? 0) <= 0) return;
    burstShownRef.current = true;
    setShowBurst(true);
  }, [ride.status, ride.chipReward]);

  // Rating dialog — sadece status'a bağlı, chipReward dep değil ki
  // chipReward null->değer geçişi cleanup ile timeout'u iptal etmesin.
  React.useEffect(() => {
    if (ride.status !== 'COMPLETED') return;
    if (ratingShownRef.current) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/rides/${ride.id}/rating`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!data.rated) {
            ratingShownRef.current = true;
            setRatingOpen(true);
          }
        }
      } catch {
        // sessizce yut
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [ride.status, ride.id]);

  // CANCELLED -> ana sayfaya dön.
  React.useEffect(() => {
    if (ride.status !== 'CANCELLED') return;
    setChatOpen(false);
    const t = setTimeout(() => router.push('/yolcu'), 900);
    return () => clearTimeout(t);
  }, [ride.status, router]);

  const mapPhase: LiveMapPhase =
    ride.status === 'ACCEPTED' || ride.status === 'EN_ROUTE_TO_PICKUP'
      ? 'to_pickup'
      : ride.status === 'IN_PROGRESS'
        ? 'in_progress'
        : ride.status === 'COMPLETED'
          ? 'completed'
          : 'planned';

  const showLiveTrackCta =
    mapPhase === 'to_pickup' || mapPhase === 'in_progress';

  return (
    <div className="space-y-4">
      <ChipGainBurst
        amount={ride.chipReward ?? 0}
        show={showBurst}
        onComplete={() => setTimeout(() => setShowBurst(false), 1800)}
      />
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
          // Küçük harita araba ikonunu göstermez — canlı takip için kullanıcı
          // sağ üstteki genişlet butonuna veya alttaki "Haritada Canlı Takip
          // Et" CTA'sına basıp fullscreen modal'ı açar.
          driver={null}
          phase={mapPhase}
          className="aspect-[4/3] sm:aspect-square"
        />
        {/* Genişlet butonu — küçük haritanın sağ üst köşesinde overlay */}
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label="Haritayı tam ekran aç"
          className="absolute top-3 right-3 z-[400] inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/95 backdrop-blur border shadow-soft hover:bg-background transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {driverPos && driverDistanceKm !== null && ride.status !== 'PENDING' && ride.status !== 'COMPLETED' && (
        <div className="rounded-xl border bg-card px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {ride.status === 'IN_PROGRESS' ? 'Varışa kalan' : 'Sürücü size'}
          </span>
          <span className="font-bold tabular-nums">
            {driverDistanceKm < 1
              ? `${Math.round(driverDistanceKm * 1000)} m`
              : `${driverDistanceKm.toFixed(2)} km`}
            {' · '}
            <span className="text-muted-foreground font-medium">
              ~{Math.max(1, Math.round(driverDistanceKm * 2.5))} dk
            </span>
          </span>
        </div>
      )}

      <Card className="p-5">
        <RideStatusFlow status={ride.status} />
        {showLiveTrackCta && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full mt-4"
            onClick={() => setMapOpen(true)}
          >
            <Navigation className="h-4 w-4" />
            Haritada Canlı Takip Et
          </Button>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Kalkış
              </p>
              <p className="text-sm truncate">{ride.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Varış
              </p>
              <p className="text-sm truncate">{ride.dropoffAddress}</p>
            </div>
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
              {ride.finalFare ? 'Toplam' : 'Tahmini ücret'}
            </p>
            <p className="text-base font-bold">
              {formatTL(ride.finalFare ?? ride.estimatedFare)}
            </p>
          </div>
        </div>
      </Card>

      {ride.driver && ride.status !== 'PENDING' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background font-bold">
                {ride.driver.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {ride.driver.fullName}
                </p>
                {ride.driver.driverProfile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-foreground" />
                      {ride.driver.driverProfile.rating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span className="truncate">
                      {ride.driver.driverProfile.vehicleModel}
                    </span>
                  </div>
                )}
                {ride.driver.driverProfile && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {ride.driver.driverProfile.plateNumber}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" aria-label="Ara">
                  <Phone className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Mesaj"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {ride.status === 'PENDING' && (
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={cancel}
        >
          <X className="h-4 w-4" />
          Talebi İptal Et
        </Button>
      )}

      {ride.status === 'COMPLETED' && (
        <Card className="p-5 bg-canvas text-white border-canvas text-center space-y-3">
          <div>
            <div className="mb-1 text-2xl">🎉</div>
            <p className="font-semibold">Yolculuk tamamlandı</p>
            {ride.driver?.fullName && (
              <p className="text-xs text-white/70 mt-1">
                {ride.driver.fullName} ile yolculuğunuzu değerlendirin
              </p>
            )}
          </div>
          <Button
            size="lg"
            className="w-full bg-white text-canvas hover:bg-white/90"
            onClick={() => setRatingOpen(true)}
          >
            <Star className="h-4 w-4" />
            Şoförü Değerlendir
          </Button>
          <button
            type="button"
            className="text-xs text-white/60 hover:text-white/80 underline-offset-2 hover:underline"
            onClick={() => router.push('/yolcu')}
          >
            Atla ve ana sayfaya dön
          </button>
        </Card>
      )}

      {currentUserId && (
        <RideChatDrawer
          rideId={ride.id}
          currentUserId={currentUserId}
          otherUserName={ride.driver?.fullName}
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
        liveDistanceKm={driverDistanceKm}
      />

      <RideRatingDialog
        rideId={ride.id}
        rateeName={ride.driver?.fullName}
        open={ratingOpen}
        onClose={() => {
          setRatingOpen(false);
          // Modal kapanınca ana sayfaya yönlendir
          setTimeout(() => router.push('/yolcu'), 200);
        }}
      />
    </div>
  );
}
