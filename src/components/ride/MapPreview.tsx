'use client';

import * as React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RidePoint } from '@/stores/useRideStore';

interface MapPreviewProps {
  pickup: RidePoint | null;
  dropoff: RidePoint | null;
  className?: string;
}

/**
 * Hafif, görsel olarak premium bir "harita" önizlemesi.
 * Google Maps anahtarı yoksa veya henüz yüklenmediyse default gösterim.
 *
 * Pin'lerin konumunu seçilen lat/lng değerlerinden TR içerisinde
 * normalize edilmiş x/y koordinatlarına maple eder.
 */
export function MapPreview({ pickup, dropoff, className }: MapPreviewProps) {
  // İstanbul-Ankara-İzmir civarına bound box (yaklaşık)
  const BOUNDS = { minLat: 36.5, maxLat: 42.5, minLng: 25.5, maxLng: 35.0 };
  const projectX = (lng: number) =>
    ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const projectY = (lat: number) =>
    100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;

  // Eğer iki nokta da seçildiyse: yerel zoom (her iki pin de kadrajda)
  let p1: { x: number; y: number } | null = null;
  let p2: { x: number; y: number } | null = null;
  if (pickup) {
    p1 = pickup && dropoff
      ? localProject(pickup, dropoff)
      : { x: projectX(pickup.lng), y: projectY(pickup.lat) };
  }
  if (dropoff) {
    p2 = pickup && dropoff
      ? localProject(dropoff, pickup, true)
      : { x: projectX(dropoff.lng), y: projectY(dropoff.lat) };
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-muted ring-1 ring-border',
        className,
      )}
      role="img"
      aria-label="Yolculuk rotası önizlemesi"
    >
      {/* Sokak ızgarası */}
      <div className="absolute inset-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="text-foreground/10"
        >
          {/* Yatay çizgiler */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 10}
              x2={100}
              y2={i * 10}
              stroke="currentColor"
              strokeWidth={0.2}
            />
          ))}
          {/* Dikey çizgiler */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 10}
              y1={0}
              x2={i * 10}
              y2={100}
              stroke="currentColor"
              strokeWidth={0.2}
            />
          ))}
          {/* Diagonal "ana yollar" */}
          <path
            d="M 0,30 Q 50,40 100,25"
            stroke="currentColor"
            strokeWidth={0.6}
            fill="none"
            opacity={0.5}
          />
          <path
            d="M 0,70 Q 40,55 100,75"
            stroke="currentColor"
            strokeWidth={0.6}
            fill="none"
            opacity={0.5}
          />
          {/* Su (Boğaz benzeri eğri) */}
          <path
            d="M 60,0 Q 65,40 55,70 Q 50,85 60,100 L 70,100 Q 65,80 70,55 Q 72,30 75,0 Z"
            fill="currentColor"
            opacity={0.06}
          />
        </svg>
      </div>

      {/* Yumuşak vinyet */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.06)_100%)]" />

      {/* Pin'ler ve rota */}
      {p1 && p2 && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="currentColor"
            strokeWidth={0.7}
            strokeDasharray="2 1"
            className="text-foreground"
          />
        </svg>
      )}

      {p1 && (
        <Pin
          variant="pickup"
          left={`${p1.x}%`}
          top={`${p1.y}%`}
          label="Kalkış"
        />
      )}
      {p2 && (
        <Pin
          variant="dropoff"
          left={`${p2.x}%`}
          top={`${p2.y}%`}
          label="Varış"
        />
      )}

      {!p1 && !p2 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-background/80 backdrop-blur px-4 py-2 text-xs font-medium text-muted-foreground border shadow-soft inline-flex items-center gap-2">
            <Navigation className="h-3.5 w-3.5" />
            Bir adres seç, rotanı görelim
          </div>
        </div>
      )}
    </div>
  );
}

function localProject(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  invert = false,
): { x: number; y: number } {
  // İki noktayı kadrajda dengele: küçük olan ~%25, büyük olan ~%75
  const minLat = Math.min(a.lat, b.lat);
  const maxLat = Math.max(a.lat, b.lat);
  const minLng = Math.min(a.lng, b.lng);
  const maxLng = Math.max(a.lng, b.lng);
  const dLat = maxLat - minLat || 0.01;
  const dLng = maxLng - minLng || 0.01;

  const x = ((a.lng - minLng) / dLng) * 50 + 25;
  const y = 100 - (((a.lat - minLat) / dLat) * 50 + 25);
  // 'invert' parametresi semantik: çağrıldığı sıraya göre x/y zaten doğru
  void invert;
  return { x, y };
}

function Pin({
  variant,
  left,
  top,
  label,
}: {
  variant: 'pickup' | 'dropoff';
  left: string;
  top: string;
  label: string;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full animate-fade-in"
      style={{ left, top }}
      aria-label={label}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full shadow-soft-lg ring-2 ring-background',
            variant === 'pickup'
              ? 'bg-foreground text-background'
              : 'bg-destructive text-destructive-foreground',
          )}
        >
          <MapPin className="h-4 w-4 fill-current" />
        </div>
        <div className="mt-1 h-2.5 w-2.5 rotate-45 rounded-sm bg-inherit" />
        {variant === 'pickup' && (
          <div className="absolute inset-0 -z-10 rounded-full bg-foreground/30 animate-pulse-ring" />
        )}
      </div>
    </div>
  );
}
