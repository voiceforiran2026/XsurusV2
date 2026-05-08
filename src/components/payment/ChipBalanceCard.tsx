'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowDownRight } from 'lucide-react';
import { formatTL } from '@/lib/format';

interface ChipBalanceCardProps {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export function ChipBalanceCard({
  balance,
  lifetimeEarned,
  lifetimeSpent,
}: ChipBalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-canvas text-white p-6 shadow-soft-lg">
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1),_transparent_60%)] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.04),_transparent_70%)] pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Chip Cüzdanı
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <motion.span
            key={balance}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="heading-display text-5xl md:text-6xl font-bold tracking-tight"
          >
            {formatTL(balance)}
          </motion.span>
        </div>
        <p className="text-xs text-white/60 mt-1">
          Sonraki yolculukta ödeme aracı olarak kullanabilirsin
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat
            icon={TrendingUp}
            label="Toplam Kazanım"
            value={formatTL(lifetimeEarned)}
          />
          <Stat
            icon={ArrowDownRight}
            label="Toplam Harcama"
            value={formatTL(lifetimeSpent)}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60 font-semibold">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-base font-bold mt-1">{value}</div>
    </div>
  );
}
