'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'x-surus-onboarded';

/**
 * Anasayfa ilk yüklenince localStorage'a bakıp `/hosgeldin`'e yönlendirir.
 * Auth'lu kullanıcılar bu komponente çarpmaz (homepage public).
 */
export function OnboardingGate() {
  const router = useRouter();

  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        router.replace('/hosgeldin');
      }
    } catch {
      // sessizce yut (incognito storage block edebilir)
    }
  }, [router]);

  return null;
}
