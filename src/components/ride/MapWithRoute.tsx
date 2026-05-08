'use client';

import { useRideStore } from '@/stores/useRideStore';
import { LiveMapClient } from './LiveMapClient';
import { cn } from '@/lib/utils';

interface MapWithRouteProps {
  className?: string;
}

export function MapWithRoute({ className }: MapWithRouteProps) {
  const pickup = useRideStore((s) => s.pickup);
  const dropoff = useRideStore((s) => s.dropoff);

  return (
    <LiveMapClient
      pickup={pickup}
      dropoff={dropoff}
      className={cn('aspect-[4/3] sm:aspect-square', className)}
    />
  );
}
