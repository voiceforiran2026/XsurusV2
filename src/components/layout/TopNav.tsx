'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X as CloseIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { XLogo } from '@/components/icons/XLogo';
import { cn } from '@/lib/utils';
import { dashboardPathForRoleClient } from '@/lib/auth/roles';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SessionUser } from '@/types/domain';

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/hizmetler', label: 'Hizmetler' },
  { href: '/nasil-calisir', label: 'Nasıl Çalışır?' },
  { href: '/kariyer', label: 'Kariyer' },
  { href: '/kurumsal', label: 'Kurumsal' },
  { href: '/yardim', label: 'Yardım' },
];

interface TopNavProps {
  variant?: 'light' | 'dark';
  /**
   * Opsiyonel — auth'lı sayfalarda server-side user prop'u geçilebilir.
   * Public/marketing sayfalarında prop verilmez; client store'dan okunur
   * (sayfa statik kalsın diye).
   */
  user?: SessionUser | null;
}

export function TopNav({ variant = 'light', user: userProp }: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const userFromStore = useAuthStore((s) => s.user);
  // Server prop'u öncelikli — varsa SSR'da hemen doğru render olur.
  const user = userProp ?? userFromStore;

  const isDark = variant === 'dark';
  const dashboardHref = user ? dashboardPathForRoleClient(user.role) : null;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors',
        isDark
          ? 'bg-canvas/85 border-white/10 text-white'
          : 'bg-background/85 border-border text-foreground',
      )}
    >
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]"
            aria-label="X"
          >
            <XLogo size="sm" variant={isDark ? 'inverted' : 'mono'} />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ease-smooth',
                    active
                      ? isDark
                        ? 'bg-white/10 text-white'
                        : 'bg-foreground/5 text-foreground'
                      : isDark
                        ? 'text-white/70 hover:text-white hover:bg-white/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              'hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              isDark
                ? 'text-white/70 hover:text-white hover:bg-white/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
            )}
            aria-label="Dil seçimi"
          >
            <Globe className="h-3.5 w-3.5" />
            TR
          </button>

          {/*
            Auth state client-side hydrate olduğu için marketing sayfalarında
            ilk paint'te `dashboardHref` null'dur, hydrate olunca dolar.
            suppressHydrationWarning ile bu küçük flash'in console warning'ini sustur.
          */}
          <span suppressHydrationWarning className="contents">
          {dashboardHref ? (
            <Button asChild size="sm" variant={isDark ? 'invert' : 'default'}>
              <Link href={dashboardHref}>
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="sm"
                variant={isDark ? 'invert' : 'outline'}
                className="hidden sm:inline-flex"
              >
                <Link href="/giris">Giriş Yap</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant={isDark ? 'invert' : 'default'}
              >
                <Link href="/kayit-ol">Kayıt Ol</Link>
              </Button>
            </>
          )}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              'md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isDark ? 'hover:bg-white/10' : 'hover:bg-foreground/5',
            )}
            aria-label="Menüyü aç"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className={cn(
            'md:hidden border-t',
            isDark ? 'border-white/10 bg-canvas' : 'border-border bg-background',
          )}
        >
          <div className="container-wide flex flex-col py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-medium',
                  isDark
                    ? 'text-white/80 hover:bg-white/5'
                    : 'text-foreground hover:bg-foreground/5',
                )}
              >
                {item.label}
              </Link>
            ))}
            {!dashboardHref && (
              <Link
                href="/giris"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'sm:hidden rounded-xl px-4 py-3 text-sm font-medium',
                  isDark
                    ? 'text-white/80 hover:bg-white/5'
                    : 'text-foreground hover:bg-foreground/5',
                )}
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
