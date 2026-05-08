'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Shield,
  Car,
  User,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Keyboard,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { dashboardPathForRoleClient } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

const QUICK_ROLES = [
  {
    role: 'admin' as const,
    icon: Shield,
    title: 'Süper Admin',
    desc: 'KPI, grafikler, havuz',
    email: 'admin@x.com',
  },
  {
    role: 'rider' as const,
    icon: User,
    title: 'Yolcu',
    desc: 'Yolculuk talebi, chip',
    email: 'yolcu@x.com',
  },
  {
    role: 'driver' as const,
    icon: Car,
    title: 'Sürücü',
    desc: 'Online toggle, kazanç',
    email: 'surucu@x.com',
  },
];

export function DemoQuickSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);
  const [open, setOpen] = React.useState(false);
  const [busyRole, setBusyRole] = React.useState<string | null>(null);
  const [resetting, setResetting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // Ctrl+Shift+D ile aç/kapat
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const switchTo = async (role: 'admin' | 'rider' | 'driver') => {
    setBusyRole(role);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return;
      const { user } = await res.json();
      setUser(user);
      router.push(dashboardPathForRoleClient(user.role));
      router.refresh();
      setOpen(false);
    } finally {
      setBusyRole(null);
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        // Sıfırlama sonrası ana sayfaya
        router.push('/');
        router.refresh();
        setConfirmReset(false);
        setOpen(false);
      }
    } finally {
      setResetting(false);
    }
  };

  const isAuthRoute = pathname?.startsWith('/giris') || pathname?.startsWith('/kayit-ol');

  return (
    <>
      {/* Floating tetik */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed z-[60] right-4 bottom-4 lg:right-6 lg:bottom-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-2.5 pr-4 py-2 shadow-soft-lg ring-1 ring-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-transform',
            )}
            aria-label="Demo paneli"
            title="Ctrl+Shift+D"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-xs font-semibold">Demo</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed z-[70] right-4 bottom-4 lg:right-6 lg:bottom-6 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-background border shadow-soft-lg overflow-hidden"
            >
              <div className="bg-canvas text-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-semibold text-sm">Demo Paneli</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
                    aria-label="Kapat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/60">
                  Sunum sırasında hesaplar arası tek tıkla geçiş.
                </p>
              </div>

              <div className="p-4 space-y-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                  Hesap geçişi
                </p>
                <div className="space-y-2">
                  {QUICK_ROLES.map((r) => {
                    const isCurrent = currentUser?.email === r.email;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => switchTo(r.role)}
                        disabled={busyRole !== null || resetting}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all duration-150 ease-smooth',
                          'hover:border-foreground hover:shadow-soft active:scale-[0.99]',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          isCurrent && 'border-foreground bg-foreground/[0.03]',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
                            isCurrent
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          {busyRole === r.role ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isCurrent ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <r.icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-1.5">
                            {r.title}
                            {isCurrent && (
                              <span className="text-[9px] font-normal text-muted-foreground">
                                · şu an aktif
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isAuthRoute && (
                  <>
                    <div className="h-px bg-border my-3" />
                    <AnimatePresence mode="wait">
                      {confirmReset ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2.5"
                        >
                          <div className="flex items-start gap-2 text-xs text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>
                              Tüm aktif yolculuklar, kartlar ve oluşan veri silinir,
                              seed'den taze veri yüklenir.
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setConfirmReset(false)}
                              disabled={resetting}
                            >
                              Vazgeç
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={reset}
                              disabled={resetting}
                            >
                              {resetting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5" />
                              )}
                              {resetting ? 'Sıfırlanıyor…' : 'Onayla'}
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="reset"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="button"
                          onClick={() => setConfirmReset(true)}
                          disabled={busyRole !== null}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-card p-3 text-sm font-medium hover:border-foreground hover:shadow-soft transition-all duration-150 disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Senaryoyu Sıfırla
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <Keyboard className="h-3 w-3" />
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Ctrl</kbd>
                  +<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Shift</kbd>
                  +<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">D</kbd>
                  ile aç/kapat
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
