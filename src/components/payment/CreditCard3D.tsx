'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, CreditCard as CreditCardIcon } from 'lucide-react';
import {
  detectBrand,
  brandLabel,
  maskedDisplay,
  type CardBrand,
} from '@/lib/cards';
import { cn } from '@/lib/utils';

interface CreditCard3DProps {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string; // ham input (henüz validate edilmemiş olabilir)
  expiryYear: string;
  cvv: string;
  flipped: boolean;
  className?: string;
}

export function CreditCard3D({
  cardNumber,
  cardholderName,
  expiryMonth,
  expiryYear,
  cvv,
  flipped,
  className,
}: CreditCard3DProps) {
  const brand = detectBrand(cardNumber);
  const masked = maskedDisplay(cardNumber);

  return (
    <div
      className={cn('relative w-full max-w-[380px] mx-auto', className)}
      style={{ perspective: '1200px' }}
    >
      <div className="aspect-[1.586] w-full" style={{ perspective: '1200px' }}>
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Ön yüz */}
          <div
            className="absolute inset-0 rounded-2xl bg-canvas text-white p-5 shadow-soft-lg overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <ShineEffect />
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <ChipIcon />
                  <Wifi className="h-4 w-4 text-white/60 rotate-90" />
                </div>
                <BrandLogo brand={brand} />
              </div>

              <div className="flex flex-col gap-3.5">
                <div
                  className="text-xl sm:text-2xl font-mono tracking-[0.18em] tabular-nums"
                  aria-label={`Kart numarası: ${masked}`}
                >
                  <SegmentedNumber value={masked} />
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">
                      Kart Sahibi
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wide truncate">
                      {cardholderName || 'AD SOYAD'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">
                      Geçerlilik
                    </p>
                    <p className="text-sm font-mono tabular-nums">
                      {(expiryMonth || 'AA').padStart(2, '0').slice(0, 2)}/
                      {(expiryYear || 'YY').padStart(2, '0').slice(0, 2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arka yüz */}
          <div
            className="absolute inset-0 rounded-2xl bg-canvas text-white shadow-soft-lg overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Manyetik şerit */}
            <div className="absolute left-0 right-0 top-7 h-12 bg-black" />
            {/* CVV alanı */}
            <div className="absolute left-5 right-5 top-24 flex items-center gap-3">
              <div className="flex-1 h-9 rounded-md bg-white/95 text-canvas flex items-center justify-end px-3 font-mono tracking-widest text-sm">
                {cvv ? cvv.replace(/\d/g, '•').slice(0, 4) : ''}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">
                CVV
              </div>
            </div>
            {/* Alt kısım */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <p className="text-[10px] text-white/50 max-w-[60%] leading-relaxed">
                Bu kart X tarafından demo amacıyla gösterilmektedir. Gerçek bir
                tahsilat yapılmaz.
              </p>
              <BrandLogo brand={brand} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ShineEffect() {
  return (
    <>
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.10),_transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.04),_transparent_70%)] pointer-events-none" />
    </>
  );
}

function ChipIcon() {
  return (
    <div className="relative h-7 w-9 rounded-md bg-gradient-to-br from-yellow-300/60 via-yellow-400/40 to-yellow-600/30 ring-1 ring-white/20 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px p-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="bg-white/10 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

function BrandLogo({ brand }: { brand: CardBrand }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={brand}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.2 }}
        className="text-right"
      >
        {brand === 'VISA' && (
          <span className="font-black italic text-2xl tracking-tighter">
            VISA
          </span>
        )}
        {brand === 'MASTERCARD' && <MastercardLogo />}
        {brand === 'AMEX' && (
          <span className="font-bold text-sm uppercase tracking-wider text-white/90">
            Amex
          </span>
        )}
        {brand === 'TROY' && (
          <span className="font-bold text-base tracking-wider text-white/90">
            troy
          </span>
        )}
        {brand === 'UNKNOWN' && (
          <CreditCardIcon className="h-6 w-6 text-white/40" />
        )}
        <p className="text-[10px] uppercase tracking-wider text-white/50 mt-1">
          {brandLabel(brand)}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

function MastercardLogo() {
  return (
    <div className="relative h-6 w-10">
      <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-white/85" />
      <div className="absolute right-0 top-0 h-6 w-6 rounded-full bg-white/40 mix-blend-screen" />
    </div>
  );
}

function SegmentedNumber({ value }: { value: string }) {
  // Boşlukla ayrılmış 4 grubu ayrı render eder ki her grup ayrı animate olsun
  const groups = value.split(' ');
  return (
    <div className="flex items-center gap-3">
      {groups.map((g, i) => (
        <motion.span
          key={i}
          layout
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          {g}
        </motion.span>
      ))}
    </div>
  );
}
