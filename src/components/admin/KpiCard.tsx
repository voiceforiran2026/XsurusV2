'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import { formatTL, formatNumber } from '@/lib/format';

type KpiFormat = 'tl' | 'count';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: KpiFormat;
  delta?: number; // yüzde fark
  hint?: string;
  highlight?: boolean;
  className?: string;
}

export function KpiCard({
  icon,
  label,
  value,
  format = 'count',
  delta,
  hint,
  highlight,
  className,
}: KpiCardProps) {
  const formatter = format === 'tl' ? formatTL : formatNumber;
  const positive = delta !== undefined && delta >= 0;

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-soft animate-fade-in',
        highlight ? 'bg-canvas text-white border-canvas' : 'bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            highlight ? 'bg-white/10' : 'bg-foreground/5',
          )}
        >
          {icon}
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              highlight
                ? positive
                  ? 'bg-white/15 text-white'
                  : 'bg-white/10 text-white/80'
                : positive
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            %{Math.abs(delta).toFixed(0)}
          </span>
        )}
      </div>
      <p
        className={cn(
          'text-xs uppercase tracking-wider font-semibold',
          highlight ? 'text-white/60' : 'text-muted-foreground',
        )}
      >
        {label}
      </p>
      <div className="text-2xl md:text-3xl font-bold mt-1 tabular-nums">
        <AnimatedCounter to={value} format={formatter} />
      </div>
      {hint && (
        <p
          className={cn(
            'text-xs mt-1',
            highlight ? 'text-white/50' : 'text-muted-foreground',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
