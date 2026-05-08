'use client';

import { useEffect } from 'react';
import { subscribe, type BroadcastEvent } from '@/lib/broadcast';

export function useBroadcastEvent(
  handler: (event: BroadcastEvent) => void,
  deps: React.DependencyList = [],
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => subscribe(handler), deps);
}
