'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  title: string;
  description: string;
  Icon: typeof Zap;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Saniyeler içinde sürücü',
    description: 'Yakındaki sürücüler eşleştirilir, en hızlısı önerilir. Beklemeden yola çıkın.',
    Icon: Zap,
    accent: 'from-foreground/10 to-foreground/[0.02]',
  },
  {
    id: 2,
    title: 'Hassas konum, canlı takip',
    description: 'Sürücünüzün aracını haritada gerçek zamanlı izleyin. ETA güncel, harita akıcı.',
    Icon: MapPin,
    accent: 'from-foreground/10 to-foreground/[0.02]',
  },
  {
    id: 3,
    title: 'Güvenli ödeme, şeffaf ücret',
    description: 'Tahmini ücret yolculuğa başlamadan ekranda. Sürpriz yok, gizli ek ücret yok.',
    Icon: ShieldCheck,
    accent: 'from-foreground/10 to-foreground/[0.02]',
  },
  {
    id: 4,
    title: 'Her yolculukta chip kazan',
    description: 'Tamamlanan yolculuğun %10\'u chip olarak hesabınıza döner. Bir sonraki yolculukta kullanabilirsiniz.',
    Icon: Sparkles,
    accent: 'from-foreground/10 to-foreground/[0.02]',
  },
];

const STORAGE_KEY = 'x-surus-onboarded';

export function WelcomeCarousel() {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  const isLast = index === SLIDES.length - 1;

  const finish = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // sessizce yut
    }
    router.push('/kayit-ol');
  }, [router]);

  const skip = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // sessizce yut
    }
    router.push('/');
  }, [router]);

  const next = () => {
    if (isLast) return finish();
    setDirection(1);
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  };

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const slide = SLIDES[index];
  const Icon = slide.Icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <Link href="/" className="text-sm font-bold tracking-tight">
          X
        </Link>
        <button
          type="button"
          onClick={skip}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Atla
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div
            className={cn(
              'relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 sm:p-12',
              slide.accent,
            )}
          >
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-foreground/[0.03] pointer-events-none" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                initial={{ x: direction * 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="relative"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-soft">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="heading-display mt-6 text-3xl sm:text-4xl font-bold leading-tight">
                  {slide.title}
                </h2>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slayt ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 ease-smooth',
                  i === index ? 'w-8 bg-foreground' : 'w-2 bg-foreground/20 hover:bg-foreground/40',
                )}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Button size="lg" className="w-full" onClick={next}>
              {isLast ? 'Hesap Oluştur' : 'İleri'}
              <ChevronRight className="h-4 w-4" />
            </Button>
            {isLast && (
              <Link
                href="/giris"
                className="text-center text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Zaten hesabım var · Giriş yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
