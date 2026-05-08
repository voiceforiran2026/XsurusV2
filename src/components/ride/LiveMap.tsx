'use client';

import * as React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
// NOT: Leaflet CSS globals.css içinden import edilir (Tailwind layer'larıyla uyum için).
import { cn } from '@/lib/utils';
import type { RidePoint } from '@/stores/useRideStore';

// Default Leaflet marker iconları .png dosyaları bekler — biz custom DivIcon
// kullanacağımız için bu sorunu hiç görmeyiz.

/**
 * Yolculuk fazına göre haritada gösterilen rotayı belirler:
 * - `planned`     : Yolculuk henüz başlamadı veya henüz sürücü bilgisi yok
 *                   → pickup → dropoff (kullanıcı varış noktasını görsün)
 * - `to_pickup`   : Sürücü yolcuyu almaya gidiyor (ACCEPTED / EN_ROUTE_TO_PICKUP)
 *                   → driver → pickup (rota sürücü hareket ettikçe kısalır)
 * - `in_progress` : Yolculuk sürüyor (IN_PROGRESS)
 *                   → driver → dropoff (rota varışa yaklaştıkça kısalır)
 * - `completed`   : Tamamlandı → pickup → dropoff (history)
 */
export type LiveMapPhase = 'planned' | 'to_pickup' | 'in_progress' | 'completed';

interface LiveMapProps {
  pickup: RidePoint | null;
  dropoff: RidePoint | null;
  className?: string;
  /** sürücü konumu (opsiyonel — yolcuda araç pin'i göstermek için) */
  driver?: { lat: number; lng: number } | null;
  /** Yolculuk fazı — rotanın hangi noktalar arası çizileceğini belirler */
  phase?: LiveMapPhase;
  interactive?: boolean;
}

const ISTANBUL_CENTER: [number, number] = [41.037, 28.985];

function svgPin(fill: string, stroke = '#fff'): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));">
      <defs>
        <linearGradient id="g${fill.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${fill}"/>
          <stop offset="100%" stop-color="${fill}" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <path d="M18 1c-9 0-15 6-15 15 0 11 15 27 15 27s15-16 15-27c0-9-6-15-15-15z"
            fill="url(#g${fill.replace('#', '')})" stroke="${stroke}" stroke-width="2.5"/>
      <circle cx="18" cy="16" r="5.5" fill="${stroke}"/>
    </svg>
  `;
}

function svgCar(): string {
  return `
    <div style="position: relative;">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: #000; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid #fff;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
          <circle cx="6.5" cy="16.5" r="2.5"/>
          <circle cx="16.5" cy="16.5" r="2.5"/>
        </svg>
      </div>
      <span style="position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.25); animation: pulseRing 1.5s cubic-bezier(0.4,0,0.6,1) infinite;"></span>
    </div>
  `;
}

const pickupIcon = L.divIcon({
  className: 'live-map-pin',
  html: svgPin('#000000'),
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -36],
});

const dropoffIcon = L.divIcon({
  className: 'live-map-pin',
  html: svgPin('#dc2626'), // destructive
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -36],
});

const driverIcon = L.divIcon({
  className: 'live-map-pin live-map-pin-car',
  html: svgCar(),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Faza göre çizilecek rotanın iki ucunu hesaplar.
 * Sürücü konumu yoksa ya da geçersizse plan rotasına (pickup→dropoff) düşer.
 */
function getRouteSegment(
  phase: LiveMapPhase,
  pickup: LatLng | null,
  dropoff: LatLng | null,
  driver?: LatLng | null,
): [LatLng, LatLng] | null {
  if (!pickup || !dropoff) return null;
  const driverValid =
    driver && Number.isFinite(driver.lat) && Number.isFinite(driver.lng);

  if (phase === 'to_pickup') {
    // Sürücü yolcuyu almaya gidiyor: driver → pickup
    if (driverValid) {
      return [{ lat: driver!.lat, lng: driver!.lng }, { lat: pickup.lat, lng: pickup.lng }];
    }
    // Henüz sürücü konumu yoksa plan rotasını göster (yolcu yine de hedefini görsün)
    return [pickup, dropoff];
  }

  if (phase === 'in_progress') {
    // Yolculuk sürüyor: driver → dropoff
    if (driverValid) {
      return [{ lat: driver!.lat, lng: driver!.lng }, { lat: dropoff.lat, lng: dropoff.lng }];
    }
    // Sürücü pin yoksa pickup → dropoff
    return [pickup, dropoff];
  }

  // planned / completed
  return [pickup, dropoff];
}

/**
 * Pickup/dropoff/driver pin değiştikçe haritayı uygun bir bound'a oturtur.
 * Faza göre relevant noktaları (driver+pickup, driver+dropoff, vs.) seçer.
 */
function ViewportFitter({
  pickup,
  dropoff,
  driver,
  phase,
}: {
  pickup: RidePoint | null;
  dropoff: RidePoint | null;
  driver?: { lat: number; lng: number } | null;
  phase: LiveMapPhase;
}) {
  const map = useMap();
  const initialFitDoneRef = React.useRef(false);
  const lastPhaseRef = React.useRef<LiveMapPhase | null>(null);

  // Sürücü konumu sürekli güncellense de map'i sürekli yeniden fit'lemiyoruz —
  // sadece "konum yok → konum var" geçişinde refit. Bu yüzden boolean kullan.
  const driverAvailable = !!driver && Number.isFinite(driver.lat) && Number.isFinite(driver.lng);

  React.useEffect(() => {
    const isFiniteLatLng = (p: { lat: number; lng: number } | null | undefined) =>
      !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng);

    const points: L.LatLngTuple[] = [];

    if (phase === 'to_pickup') {
      if (driverAvailable && driver) points.push([driver.lat, driver.lng]);
      if (isFiniteLatLng(pickup)) points.push([pickup!.lat, pickup!.lng]);
      // Bounds yetersizse (sadece pickup), dropoff'u da dahil et
      if (points.length < 2 && isFiniteLatLng(dropoff)) {
        points.push([dropoff!.lat, dropoff!.lng]);
      }
    } else if (phase === 'in_progress') {
      if (driverAvailable && driver) points.push([driver.lat, driver.lng]);
      if (isFiniteLatLng(dropoff)) points.push([dropoff!.lat, dropoff!.lng]);
      if (points.length < 2 && isFiniteLatLng(pickup)) {
        points.push([pickup!.lat, pickup!.lng]);
      }
    } else {
      // planned / completed
      if (isFiniteLatLng(pickup)) points.push([pickup!.lat, pickup!.lng]);
      if (isFiniteLatLng(dropoff)) points.push([dropoff!.lat, dropoff!.lng]);
    }

    if (points.length === 0) return;

    const container = map.getContainer();
    if (!container || container.offsetParent === null) return;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) return;

    map.invalidateSize();

    // İlk fit instant; faz değişince animasyonlu geçiş.
    const phaseChanged =
      lastPhaseRef.current !== null && lastPhaseRef.current !== phase;
    const useAnimation = initialFitDoneRef.current && phaseChanged;

    try {
      if (points.length === 1) {
        if (useAnimation) {
          map.flyTo(points[0], 14, { duration: 0.6 });
        } else {
          map.setView(points[0], 14, { animate: false });
        }
      } else {
        const bounds = L.latLngBounds(points);
        if (!bounds.isValid()) return;
        if (useAnimation) {
          map.flyToBounds(bounds, { padding: [44, 44], duration: 0.6, maxZoom: 14 });
        } else {
          map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14, animate: false });
        }
      }
      initialFitDoneRef.current = true;
      lastPhaseRef.current = phase;
    } catch {
      // sessizce yut
    }
    // KASITLI: driver?.lat / driver?.lng deps'te yok — pin saniyede update
    // olduğu için harita sürekli sallanmasın. Sadece "konum yok → konum var"
    // geçişi refit tetikler (driverAvailable boolean'ı üzerinden).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    phase,
    driverAvailable,
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
  ]);

  return null;
}

export default function LiveMap({
  pickup,
  dropoff,
  className,
  driver,
  phase = 'planned',
  interactive = false,
}: LiveMapProps) {
  const route = getRouteSegment(phase, pickup, dropoff, driver);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-muted ring-1 ring-border',
        className,
      )}
    >
      <MapContainer
        center={ISTANBUL_CENTER}
        zoom={11}
        scrollWheelZoom={interactive}
        zoomControl={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: 'hsl(0 0% 96%)' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={19}
        />
        {/* Yer adlarını minimal şekilde üzerine bindir */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={19}
          opacity={0.85}
        />

        {pickup && (
          <Marker
            position={[pickup.lat, pickup.lng]}
            icon={pickupIcon}
            interactive={false}
          />
        )}
        {dropoff && (
          <Marker
            position={[dropoff.lat, dropoff.lng]}
            icon={dropoffIcon}
            interactive={false}
          />
        )}
        {driver && (
          <Marker
            position={[driver.lat, driver.lng]}
            icon={driverIcon}
            interactive={false}
          />
        )}

        {/* Aktif rota (faza göre) */}
        {route && (
          <>
            {/* Static rota — soluk arkaplan */}
            <Polyline
              positions={[
                [route[0].lat, route[0].lng],
                [route[1].lat, route[1].lng],
              ]}
              pathOptions={{
                color: '#0a0a0a',
                weight: 3.5,
                opacity: 0.18,
                lineCap: 'round',
              }}
              interactive={false}
            />
            {/* Animasyonlu üst polyline — dashArray + CSS keyframes ile akar */}
            <Polyline
              positions={[
                [route[0].lat, route[0].lng],
                [route[1].lat, route[1].lng],
              ]}
              pathOptions={{
                color: '#0a0a0a',
                weight: 3.5,
                opacity: 0.95,
                dashArray: '8 10',
                lineCap: 'round',
                className: 'route-polyline-animated',
              }}
              interactive={false}
            />
          </>
        )}

        {/* `to_pickup` ve `in_progress` fazlarında plan rotasını (pickup→dropoff)
            soluk bir referans olarak göster — yolcu/sürücü hedefini sürekli görsün */}
        {(phase === 'to_pickup' || phase === 'in_progress') && pickup && dropoff && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [dropoff.lat, dropoff.lng],
            ]}
            pathOptions={{
              color: '#0a0a0a',
              weight: 2,
              opacity: 0.08,
              dashArray: '4 6',
              lineCap: 'round',
            }}
            interactive={false}
          />
        )}

        <ViewportFitter pickup={pickup} dropoff={dropoff} driver={driver} phase={phase} />
      </MapContainer>

      {!pickup && !dropoff && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-background/85 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-muted-foreground border shadow-soft">
            Adres seç, rotanı görelim
          </div>
        </div>
      )}
    </div>
  );
}
