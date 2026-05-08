'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FrameContainerProvider } from './MobileFrameContext';

interface MobileFrameProps {
  children: React.ReactNode;
  /** Frame içinde sticky-top olarak yerleşir (slim TopBar için). */
  topSlot?: React.ReactNode;
  /** Frame içinde sticky-bottom (BottomNav için). */
  bottomSlot?: React.ReactNode;
  className?: string;
}

/**
 * Yolcu/sürücü ekranları için kapsayıcı.
 *
 * - Mobile: full-bleed, üstte topSlot, ortada children, altta bottomSlot
 * - Desktop (lg+): device-frame içinde aynı yapı (notch + rounded + border)
 *
 * Frame içinin DOM ref'ini context üzerinden child'lara verir; chat drawer,
 * rating dialog, incoming ride modal gibi overlay'ler bu container'a
 * `createPortal` ile render edilerek **çerçevenin DIŞINA taşmaz**.
 */
export function MobileFrame({
  children,
  topSlot,
  bottomSlot,
  className,
}: MobileFrameProps) {
  const [frameEl, setFrameEl] = React.useState<HTMLDivElement | null>(null);

  return (
    <div
      className={cn(
        'w-full',
        'lg:flex lg:justify-center lg:py-8',
        'lg:bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.04),_transparent_70%)]',
        className,
      )}
    >
      <div
        ref={setFrameEl}
        className={cn(
          'relative flex flex-col bg-background overflow-hidden',
          // Mobile: tam yükseklik (h-screen) — tüm content frame içinde scroll edilir
          'min-h-screen',
          // Desktop: device frame
          'lg:min-h-0 lg:mx-auto lg:w-full lg:max-w-[420px]',
          'lg:rounded-[44px] lg:border-[10px] lg:border-black',
          'lg:shadow-soft-lg',
          'lg:h-[calc(100vh-4rem)]',
        )}
      >
        {/* Notch — sadece desktop */}
        <div
          aria-hidden
          className="hidden lg:block absolute left-1/2 top-0 z-50 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black"
        />

        {/* Top bar — sticky inside frame */}
        {topSlot && (
          <div className="sticky top-0 z-30 lg:pt-7 bg-background/95 backdrop-blur border-b border-border">
            {topSlot}
          </div>
        )}

        {/* Scrollable content.
            `isolate` (CSS isolation: isolate) yeni bir stacking context yaratır.
            Bu sayede Leaflet harita pane'lerinin yüksek z-index değerleri
            (markerPane:600, popupPane:700) frame seviyesindeki dialog/drawer
            overlay'lerini örtmez — tüm Leaflet z-index'leri bu div'in iç
            kapsamında izole kalır. */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden isolate">
          <FrameContainerProvider container={frameEl}>
            {children}
          </FrameContainerProvider>
        </div>

        {/* Bottom nav — sticky inside frame */}
        {bottomSlot && (
          <div className="shrink-0">
            {bottomSlot}
          </div>
        )}
      </div>
    </div>
  );
}
