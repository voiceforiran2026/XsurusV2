'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { formatTL } from '@/lib/format';

interface ChipGainBurstProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

/**
 * Tamamlanan yolculuk sonrası yolcu sekmesinde:
 * sayaç 0'dan amount'a animasyonlu artar, parlama + parçacık efektleri.
 */
export function ChipGainBurst({ amount, show, onComplete }: ChipGainBurstProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!show) return;
    setCount(0);
    const start = performance.now();
    const duration = 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(amount * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (onComplete) onComplete();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, amount, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="burst"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="relative rounded-3xl bg-canvas text-white p-10 shadow-soft-lg overflow-hidden text-center max-w-sm"
          >
            {/* Parlama */}
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute inset-0 m-auto h-32 w-32 rounded-full bg-white/30 pointer-events-none"
            />
            {/* Parçacıklar */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = 110 + (i % 3) * 20;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0.5,
                  }}
                  transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-2 w-2 -ml-1 -mt-1 rounded-full bg-white"
                />
              );
            })}

            <div className="relative">
              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-canvas"
              >
                <Sparkles className="h-7 w-7" />
              </motion.div>
              <div className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                Chip Kazandın!
              </div>
              {/*
                Önceki sürümde key her frame'de değişerek motion.div'i
                remount ediyordu (saniyede ~60 kez fade-in başlıyordu →
                tüm sayfa süründürücü oluyordu). Sade <div> ile içerik
                update edilir, animasyon dış kapsayıcılarda kalır.
              */}
              <div className="heading-display text-5xl font-bold mt-2 tabular-nums">
                +{formatTL(count)}
              </div>
              <p className="mt-2 text-xs text-white/60">
                Bir sonraki yolculuğunda kullanabilirsin
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
