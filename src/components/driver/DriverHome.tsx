'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Clock, Route as RouteIcon, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { OnlineToggle } from '@/components/driver/OnlineToggle';
import { IncomingRideModal } from '@/components/driver/IncomingRideModal';
import { useDriverStore } from '@/stores/useDriverStore';
import { useBroadcastEvent } from '@/hooks/useBroadcastEvent';
import { usePollingFallback } from '@/hooks/usePollingFallback';
import { formatTL, formatDistance } from '@/lib/format';
import { settleRide } from '@/lib/pricing';
import { EmptyState } from '@/components/common/EmptyState';

export function DriverHome() {
  const router = useRouter();
  const {
    isOnline,
    pending,
    refreshPending,
    setActiveOffer,
    activeOffer,
  } = useDriverStore();

  // Yolcudan gelen yeni taleplerde anlık yenile
  useBroadcastEvent(
    (e) => {
      if (e.type === 'ride:new') void refreshPending();
      if (e.type === 'ride:cancelled') void refreshPending();
    },
    [refreshPending],
  );

  // Polling fallback (BroadcastChannel başarısızsa)
  usePollingFallback(refreshPending, 3000, isOnline);

  return (
    <div className="space-y-4">
      <OnlineToggle />

      <AnimatePresence>
        {isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Bekleyen Talepler
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold px-1.5">
                  {pending.length}
                </span>
              </h2>
            </div>

            {pending.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-5 w-5" />}
                title="Yeni talep bekleniyor"
                description="Yakında bir yolculuk talebi gelecek. Hazır olun."
              />
            ) : (
              <div className="space-y-2.5">
                {pending.map((p) => {
                  const earning = settleRide(p.estimatedFare).driverEarning;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActiveOffer(p)}
                      className="w-full text-left"
                    >
                      <Card className="p-4 hover:shadow-soft hover:border-foreground/30 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold mb-0.5">
                              {p.serviceType === 'GO'
                                ? 'Gönderi'
                                : 'Yolculuk'}{' '}
                              · {p.riderName.split(' ')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {p.pickupAddress}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              → {p.dropoffAddress}
                            </div>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <RouteIcon className="h-3 w-3" />
                                {formatDistance(p.distanceKm)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {formatTL(earning)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">
                              {formatTL(p.estimatedFare)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOnline && (
        <Card className="p-5 bg-muted/40 border-dashed">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Çevrimiçi olduğunuzda yakındaki yolculuk talepleri otomatik
              olarak size düşer. Talep ekrana <strong>nabız animasyonlu</strong>{' '}
              modal olarak gelecek.
            </div>
          </div>
        </Card>
      )}

      <IncomingRideModal />

      {/* Sürücü modalı kapatınca aktif teklifin temizlenmesi store'da olur */}
      {activeOffer === null && null}
    </div>
  );
}
