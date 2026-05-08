'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  LineChart,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatTL, formatNumber } from '@/lib/format';

interface MonthlyDatum {
  date: string;
  label: string;
  revenue: number;
  rides: number;
  activeRiders: number;
}

export function MonthlyTrendChart({ data }: { data: MonthlyDatum[] }) {
  const [metric, setMetric] = React.useState<'revenue' | 'rides' | 'activeRiders'>('revenue');

  const config = {
    revenue: { label: 'Gelir', format: formatTL },
    rides: { label: 'Yolculuk', format: formatNumber },
    activeRiders: { label: 'Aktif Yolcu', format: formatNumber },
  } as const;
  const cfg = config[metric];

  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 className="text-base font-semibold">Aylık Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Son 30 günde günlük {cfg.label.toLowerCase()}
          </p>
        </div>
        <div className="inline-flex items-center rounded-full bg-muted p-0.5 text-xs">
          {(['revenue', 'rides', 'activeRiders'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMetric(k)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                metric === k
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {config[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="bwArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="label"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              interval={4}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v) =>
                metric === 'revenue'
                  ? new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(v)
                  : String(v)
              }
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: 4 }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              }}
              formatter={(value: number | string) => [cfg.format(Number(value)), cfg.label]}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              fill="url(#bwArea)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--foreground))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ComparisonLineChart({
  data,
}: {
  data: MonthlyDatum[];
}) {
  return (
    <Card className="p-5 lg:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Yolculuk + Aktif Yolcu</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Son 30 gün karşılaştırma
        </p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" interval={4} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="rides"
              name="Yolculuk"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="activeRiders"
              name="Aktif Yolcu"
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.4}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
