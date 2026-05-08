'use client';

import * as React from 'react';
import { Power, Loader2 } from 'lucide-react';
import { useDriverStore } from '@/stores/useDriverStore';
import { cn } from '@/lib/utils';

export function OnlineToggle() {
  const { isOnline, togglingOnline, setOnline, hydrateOnline } =
    useDriverStore();

  React.useEffect(() => {
    void hydrateOnline();
  }, [hydrateOnline]);

  const handleToggle = () => {
    if (togglingOnline) return;
    void setOnline(!isOnline);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isOnline}
      disabled={togglingOnline}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ease-smooth',
        isOnline
          ? 'border-foreground bg-canvas text-white shadow-soft-lg'
          : 'border-border bg-card hover:border-foreground/40 hover:shadow-soft',
      )}
    >
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'relative flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300',
              isOnline
                ? 'bg-white text-canvas'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {togglingOnline ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Power className="h-5 w-5" />
            )}
            {isOnline && (
              <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
            )}
          </div>
          <div>
            <p
              className={cn(
                'text-[10px] uppercase tracking-wider font-semibold',
                isOnline ? 'text-white/60' : 'text-muted-foreground',
              )}
            >
              Durum
            </p>
            <p className="text-lg font-bold">
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </p>
            <p
              className={cn(
                'text-xs mt-0.5',
                isOnline ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {isOnline
                ? 'Yeni talepler size düşecek'
                : "Çevrimiçi olun, yolculuğa başlayın"}
            </p>
          </div>
        </div>

        <SwitchVisual isOnline={isOnline} />
      </div>
    </button>
  );
}

function SwitchVisual({ isOnline }: { isOnline: boolean }) {
  return (
    <div
      className={cn(
        'relative h-7 w-12 rounded-full border-2 transition-colors duration-300',
        isOnline ? 'bg-white border-white' : 'bg-muted border-border',
      )}
    >
      <div
        className={cn(
          'absolute top-0 h-[calc(100%-4px)] m-[2px] aspect-square rounded-full transition-all duration-200 ease-smooth',
          isOnline ? 'bg-canvas' : 'bg-foreground',
        )}
        style={{ left: isOnline ? 'calc(100% - 24px)' : '0' }}
      />
    </div>
  );
}
