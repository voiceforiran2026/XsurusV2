import * as React from 'react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  navVariant?: 'light' | 'dark';
  showFooter?: boolean;
}

/**
 * Public/marketing sayfa kapsayıcısı.
 *
 * Eski sürüm: server component olarak `getCurrentUser()` çağırıyordu →
 * cookies okuduğu için Next.js tüm marketing sayfalarını **dynamic**
 * (`ƒ`) işaretliyordu. Bu yüzden `/`, `/hizmetler`, `/nasil-calisir`...
 * her tıklamada server-side render + DB sorgusu çalıştırıyordu.
 *
 * Yeni sürüm: cookies okumuyor, sadece children render ediyor. Auth bilgisi
 * client tarafında `useAuthStore` üzerinden hidrate edilir (TopNav okuyor).
 * Sonuç: bu sayfalar tamamen statik prerender olur (`○`), CDN benzeri
 * anında servis edilir, navigasyon ışık hızında.
 */
export function AppShell({
  children,
  navVariant = 'light',
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav variant={navVariant} />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
