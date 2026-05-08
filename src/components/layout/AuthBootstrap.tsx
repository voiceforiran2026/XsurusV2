'use client';

import * as React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Public sayfalarda TopNav'in giriş durumunu bilmesi için, sayfa hidrate
 * olur olmaz tek seferlik /api/auth/me çağrısı yapar ve store'a yazar.
 *
 * Bu sayede AppShell server-side cookies okumak zorunda kalmıyor →
 * marketing sayfaları **static prerender** edilebiliyor → tıklamalar anında.
 *
 * Auth korumalı layout'larda (rider/driver/admin) zaten AuthHydrator
 * server prop'tan store'u dolduruyor — orada bu komponent re-fetch yapmaz
 * (store.user dolu olduğu için iç guard'ı boşa çıkar).
 */
export function AuthBootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const hasUser = useAuthStore((s) => s.user !== null);

  React.useEffect(() => {
    if (hasUser) return;
    void bootstrap();
    // bootstrap fonksiyonu Zustand store'dan stable referans;
    // ilk mount'ta tek sefer çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
