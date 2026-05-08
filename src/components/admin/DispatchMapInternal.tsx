'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

export interface DispatchRide {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE_TO_PICKUP' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  pickupLat: number;
  pickupLng: number;
  driverLat: number | null;
  driverLng: number | null;
  rider: { fullName: string };
}

export interface DispatchDriver {
  userId: string;
  currentLat: number | null;
  currentLng: number | null;
  user: { fullName: string };
}

interface DispatchMapInternalProps {
  rides: DispatchRide[];
  drivers: DispatchDriver[];
  onSelect?: (rideId: string) => void;
  selectedRideId?: string | null;
}

const ISTANBUL: [number, number] = [41.037, 28.985];

const STATUS_COLORS: Record<DispatchRide['status'], string> = {
  PENDING: '#eab308',
  ACCEPTED: '#3b82f6',
  EN_ROUTE_TO_PICKUP: '#3b82f6',
  IN_PROGRESS: '#10b981',
  COMPLETED: '#737373',
  CANCELLED: '#dc2626',
};

function makeRideIcon(status: DispatchRide['status'], isSelected: boolean): L.DivIcon {
  const color = STATUS_COLORS[status];
  const ring = isSelected ? `<div style="position:absolute;inset:-6px;border:2px solid ${color};border-radius:50%;animation:pulseRing 1.4s ease-out infinite;"></div>` : '';
  return L.divIcon({
    className: 'dispatch-pin',
    html: `<div style="position:relative;width:24px;height:24px;">${ring}<div style="width:100%;height:100%;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function makeDriverIdleIcon(): L.DivIcon {
  return L.divIcon({
    className: 'dispatch-driver-idle',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#fff;border:2.5px solid #0a0a0a;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ rides, drivers }: { rides: DispatchRide[]; drivers: DispatchDriver[] }) {
  const map = useMap();
  React.useEffect(() => {
    const points: L.LatLngTuple[] = [];
    for (const r of rides) {
      if (Number.isFinite(r.pickupLat) && Number.isFinite(r.pickupLng)) {
        points.push([r.pickupLat, r.pickupLng]);
      }
      if (r.driverLat !== null && r.driverLng !== null) {
        points.push([r.driverLat, r.driverLng]);
      }
    }
    for (const d of drivers) {
      if (d.currentLat !== null && d.currentLng !== null) {
        points.push([d.currentLat, d.currentLng]);
      }
    }
    if (points.length === 0) return;
    try {
      const bounds = L.latLngBounds(points);
      if (!bounds.isValid()) return;
      map.flyToBounds(bounds, { padding: [60, 60], duration: 0.7, maxZoom: 13 });
    } catch {
      // sessizce yut
    }
  }, [map, rides, drivers]);
  return null;
}

export function DispatchMapInternal({
  rides,
  drivers,
  onSelect,
  selectedRideId,
}: DispatchMapInternalProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl ring-1 ring-border">
      <MapContainer
        center={ISTANBUL}
        zoom={11}
        scrollWheelZoom
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c', 'd']}
          opacity={0.85}
        />

        {/* Atanmamış pinler — driverLat yoksa pickup'ta göster */}
        {rides.map((r) => {
          const lat = r.driverLat ?? r.pickupLat;
          const lng = r.driverLng ?? r.pickupLng;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return (
            <Marker
              key={r.id}
              position={[lat, lng]}
              icon={makeRideIcon(r.status, selectedRideId === r.id)}
              eventHandlers={{
                click: () => onSelect?.(r.id),
              }}
            />
          );
        })}

        {/* Boştaki online sürücüler */}
        {drivers.map((d) =>
          d.currentLat !== null && d.currentLng !== null ? (
            <Marker
              key={d.userId}
              position={[d.currentLat, d.currentLng]}
              icon={makeDriverIdleIcon()}
              interactive={false}
            />
          ) : null,
        )}

        <FitBounds rides={rides} drivers={drivers} />
      </MapContainer>
    </div>
  );
}
