import { Sparkles, Clock, Route as RouteIcon } from 'lucide-react';
import { formatTL, formatDistance } from '@/lib/format';
import { PRICING_CONFIG } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface FareEstimateCardProps {
  distanceKm?: number;
  estimatedFare?: number;
  eta?: number;
  loading?: boolean;
  className?: string;
}

export function FareEstimateCard({
  distanceKm,
  estimatedFare,
  eta,
  loading,
  className,
}: FareEstimateCardProps) {
  const chipPreview =
    estimatedFare !== undefined
      ? Math.round(estimatedFare * PRICING_CONFIG.chipReward * 100) / 100
      : 0;

  const hasQuote = estimatedFare !== undefined && distanceKm !== undefined;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-4 transition-colors duration-200',
        hasQuote && 'border-foreground/30',
        className,
      )}
    >
      {hasQuote ? (
        <div className="flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <RouteIcon className="h-3 w-3" />
                {formatDistance(distanceKm!)}
              </span>
              {eta !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />~{eta} dk
                </span>
              )}
            </div>
            <div className="text-2xl font-bold leading-none tracking-tight">
              {formatTL(estimatedFare!)}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <Sparkles className="h-3 w-3" />
              Bu yolculuktan{' '}
              <span className="font-semibold text-foreground">
                {formatTL(chipPreview)}
              </span>{' '}
              chip kazanırsın
            </div>
          </div>
          {loading && (
            <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">
            {loading
              ? 'Ücret hesaplanıyor…'
              : 'İki nokta seç, anlık ücreti gör'}
          </div>
        </div>
      )}
    </div>
  );
}
