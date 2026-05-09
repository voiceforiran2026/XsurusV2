'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Route as RouteIcon,
  Clock,
  Sparkles,
  X as CloseIcon,
  Check,
  Loader2,
  Car,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDriverStore } from '@/stores/useDriverStore';
import { formatTL, formatDistance, formatRelative } from '@/lib/format';
import { settleRide } from '@/lib/pricing';

export function IncomingRideModal() {
  const router = useRouter();
  const offer = useDriverStore((s) => s.activeOffer);
  const accept = useDriverStore((s) => s.acceptOffer);
  const pass = useDriverStore((s) => s.passOffer);
  const [accepting, setAccepting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const open = !!offer;

  const onAccept = async () => {
    if (!offer) return;
    setError(null);
    setAccepting(true);
    try {
      const r = await accept(offer.id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.push(`/surucu/aktif?ride=${offer.id}`);
    } finally {
      setAccepting(false);
    }
  };

  const onDecline = () => {
    if (!offer || accepting) return;
    pass(offer.id);
  };

  if (!offer) return null;

  const driverEarning = settleRide(offer.estimatedFare).driverEarning;
  const Icon = offer.serviceType === 'GO' ? Package : Car;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !accepting) onDecline();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden gap-0 rounded-2xl grid-cols-1"
        style={{ width: 'min(360px, calc(100% - 16px))', maxWidth: '360px' }}
      >
        {/* Üst pulse-ring vurgu */}
        <div className="relative bg-canvas text-white px-4 pt-5 pb-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_60%)]" />
          <div className="relative flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-canvas shrink-0">
                <Icon className="h-4 w-4" />
                <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base text-white font-semibold truncate leading-tight">
                  Yeni {offer.serviceType === 'GO' ? 'Gönderi' : 'Yolculuk'}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-white/60 mt-0.5 truncate">
                  {formatRelative(offer.requestedAt)} ·{' '}
                  {offer.riderName.split(' ')[0]}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={onDecline}
              disabled={accepting}
              className="text-white/60 hover:text-white transition-colors p-1 shrink-0"
              aria-label="Pas geç"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-1.5 text-center">
            <Stat
              icon={RouteIcon}
              label="Mesafe"
              value={formatDistance(offer.distanceKm)}
            />
            <Stat
              icon={Clock}
              label="Süre"
              value={`~${Math.max(2, Math.round(offer.distanceKm * 2.5))} dk`}
            />
            <Stat
              icon={Sparkles}
              label="Kazanç"
              value={formatTL(driverEarning)}
              highlight
            />
          </div>
        </div>

        <div className="px-4 py-4 space-y-3.5">
          <div className="space-y-3">
            <RouteRow
              icon={
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                  <MapPin className="h-3 w-3" />
                </div>
              }
              label="Kalkış"
              value={offer.pickupAddress}
            />
            <RouteRow
              icon={
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <MapPin className="h-3 w-3" />
                </div>
              }
              label="Varış"
              value={offer.dropoffAddress}
            />
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="default"
              className="flex-1 px-2 text-sm h-11"
              onClick={onDecline}
              disabled={accepting}
            >
              Pas Geç
            </Button>
            <Button
              size="default"
              className="flex-1 px-2 text-sm h-11 gap-1.5"
              onClick={onAccept}
              disabled={accepting}
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="truncate">
                {accepting ? 'Onaylanıyor' : 'Onayla'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border min-w-0 ${
        highlight
          ? 'border-white/20 bg-white/10'
          : 'border-white/10 bg-white/5'
      } px-1.5 py-2.5`}
    >
      <div className="text-white/50 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-0.5 justify-center">
        <Icon className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`text-[12px] font-bold mt-1 truncate tabular-nums ${
          highlight ? 'text-white' : 'text-white/90'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RouteRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-xs leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}
