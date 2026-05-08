'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote } from 'lucide-react';

interface MoneyFlowAnimProps {
  /** Akışı başlat — her yeni run id ile yeni partikül seti */
  runId: number | null;
  /** Akış yönü: 'in' (havuza giriş), 'out' (havuzdan dağıt) */
  direction?: 'in' | 'out';
  count?: number;
  duration?: number;
}

/**
 * Belirli bir alandan diğerine "para" akışı görselleştirir.
 * Container relatively positioned olmalı; animasyon containerin tüm alanını kaplar.
 */
export function MoneyFlowAnim({
  runId,
  direction = 'out',
  count = 14,
  duration = 1.6,
}: MoneyFlowAnimProps) {
  return (
    <AnimatePresence>
      {runId !== null && (
        <div
          key={runId}
          className="pointer-events-none absolute inset-0 overflow-visible z-20"
          aria-hidden
        >
          {Array.from({ length: count }).map((_, i) => {
            const delay = (i / count) * 0.25;
            const xStart = direction === 'out' ? 50 : Math.random() * 100;
            const yStart = direction === 'out' ? 50 : -10;
            const xEnd =
              direction === 'out'
                ? Math.random() * 120 - 10 // her yöne yayılma
                : 50 + (Math.random() - 0.5) * 30;
            const yEnd = direction === 'out' ? 110 : 50;

            return (
              <motion.span
                key={i}
                initial={{
                  left: `${xStart}%`,
                  top: `${yStart}%`,
                  opacity: 0,
                  scale: 0.6,
                  rotate: 0,
                }}
                animate={{
                  left: `${xEnd}%`,
                  top: `${yEnd}%`,
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1.1, 1, 0.7],
                  rotate: Math.random() * 90 - 45,
                }}
                transition={{
                  duration,
                  delay,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.2, 0.7, 1],
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="flex h-7 w-10 items-center justify-center rounded-md bg-foreground text-background shadow-soft-lg">
                  <Banknote className="h-3.5 w-3.5" />
                </span>
              </motion.span>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
