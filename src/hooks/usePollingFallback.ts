'use client';

import { useEffect } from 'react';
import { isBroadcastSupported } from '@/lib/broadcast';

/**
 * BroadcastChannel desteklenmediğinde verilen fonksiyonu intervalde çağırır.
 * Demo, BroadcastChannel destekliyorsa polling kapalıdır — gereksiz network
 * gürültüsünü ve render'ı engeller (asıl sayfa hissi: hızlı).
 *
 * Sayfada zaten BroadcastChannel olayları geliyorsa polling yedek değildir.
 * Eski kod 3sn'de bir fetch atıyordu, bu sayfayı sürükliyordu.
 */
export function usePollingFallback(
  fn: () => void,
  ms = 3000,
  active = true,
): void {
  useEffect(() => {
    if (!active) return;
    // BroadcastChannel destekleniyorsa fallback'a hiç ihtiyaç yok.
    if (isBroadcastSupported()) return;
    const t = setInterval(fn, ms);
    return () => clearInterval(t);
  }, [fn, ms, active]);
}
