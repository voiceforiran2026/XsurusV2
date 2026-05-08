'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatNumber, formatTL } from '@/lib/format';

interface HourlyDatum {
  hour: number;
  label: string;
  rides: number;
  revenue: number;
}

export function HourlyDistributionChart({ data }: { data: HourlyDatum[] }) {
  // Tepe saatleri vurgu
  const max = Math.max(...data.map((d) => d.rides), 1);

  return (
    <Card className="p-5 lg:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Saatlik Yolculuk Dağılımı</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tüm zamanların saat bazında toplam yolculuk sayısı
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(h) => (h % 3 === 0 ? `${String(h).padStart(2, '0')}` : '')}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number | string, key: string) => {
                if (key === 'rides') return [formatNumber(Number(value)), 'Yolculuk'];
                if (key === 'revenue') return [formatTL(Number(value)), 'Gelir'];
                return [value, key];
              }}
              labelFormatter={(h: number) => `${String(h).padStart(2, '0')}:00 - ${String(h).padStart(2, '0')}:59`}
            />
            <Bar dataKey="rides" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.rides >= max * 0.85
                      ? 'hsl(var(--foreground))'
                      : d.rides >= max * 0.5
                        ? 'hsl(var(--foreground) / 0.5)'
                        : 'hsl(var(--foreground) / 0.2)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
