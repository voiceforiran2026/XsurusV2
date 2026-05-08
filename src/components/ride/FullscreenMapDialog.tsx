'use client';

import * as React from 'react';
import { Navigation, MapPin, Clock, Route as RouteIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LiveMapClient } from '@/components/ride/LiveMapClient';
import type { LiveMapPhase } from '@/components/ride/LiveMap';
import type { RidePoint } from '@/stores/useRideStore';
import { formatDistance } from '@/lib/format';

interface FullscreenMapDialogProps {
  open: boolean;
  onClose: () => void;
  pickup: RidePoint;
  dropoff: RidePoint;
  driver?: { lat: number; lng: number } | null;
  phase: LiveMapPhase;
  /** Yolcuya kalan mesafe (varsa) — header'da gösterilir */
  liveDistanceKm?: number | null;
}

/**
 * Yolculuk sırasında "Haritada Gör" butonuna basıldığında açılan
 * tam ekran (mobile frame içinde frame'i dolduran) interaktif harita.
 *
 * Küçük harita aspect-[4/3] sınırlanmıştı; bu modal kullanıcıya canlı
 * sürücü pozisyonunu sürükleyip yakınlaştırma imkanıyla gösterir.
 */
export function FullscreenMapDialog({
  open,
  onClose,
  pickup,
  dropoff,
  driver,
  phase,
  liveDistanceKm,
}: FullscreenMapDialogProps) {
  const phaseLabel: Record<LiveMapPhase, string> = {
    planned: 'Sürücü aranıyor',
    to_pickup: 'Sürücü yolda',
    in_progress: 'Yolculuk sürüyor',
    completed: 'Yolculuk tamamlandı',
  };

  const targetLabel =
    phase === 'to_pickup'
      ? 'Yolcuya'
      : phase === 'in_progress'
        ? 'Varışa'
        : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-none w-[calc(100%-1rem)] h-[calc(100%-2rem)] sm:h-[calc(100%-3rem)] p-0 overflow-hidden gap-0 grid-rows-[auto_1fr]"
      >
        <DialogTitle className="sr-only">Canlı Harita</DialogTitle>

        {/* Header — kompakt durum + mesafe */}
        <div className="border-b px-4 py-3 flex items-center gap-3 bg-background/95">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">
              {phaseLabel[phase]}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
              {phase === 'to_pickup'
                ? `→ ${pickup.address}`
                : phase === 'in_progress'
                  ? `→ ${dropoff.address}`
                  : `${pickup.address} → ${dropoff.address}`}
            </p>
          </div>
          {targetLabel && liveDistanceKm !== null && liveDistanceKm !== undefined && (
            <div className="text-right shrink-0 mr-8">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {targetLabel}
              </p>
              <p className="text-sm font-bold tabular-nums leading-tight">
                {liveDistanceKm < 1
                  ? `${Math.round(liveDistanceKm * 1000)} m`
                  : formatDistance(liveDistanceKm)}
              </p>
            </div>
          )}
        </div>

        {/* Harita — tam genişlik, interaktif */}
        <div className="relative min-h-0">
          <LiveMapClient
            pickup={pickup}
            dropoff={dropoff}
            driver={driver}
            phase={phase}
            interactive
            className="h-full w-full rounded-none"
          />
          {/* Alt bilgi şeridi: kalkış/varış adresleri */}
          <div className="absolute left-3 right-3 bottom-3 rounded-2xl bg-background/95 backdrop-blur border shadow-soft p-3 space-y-1.5 pointer-events-none">
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background mt-0.5 shrink-0">
                <MapPin className="h-2.5 w-2.5" />
              </div>
              <p className="text-xs flex-1 truncate">{pickup.address}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground mt-0.5 shrink-0">
                <MapPin className="h-2.5 w-2.5" />
              </div>
              <p className="text-xs flex-1 truncate">{dropoff.address}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
