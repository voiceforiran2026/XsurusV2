'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatTL } from '@/lib/format';

interface DistDatum {
  key: string;
  label: string;
  value: number;
}

const COLORS = [
  'hsl(var(--foreground))',
  'hsl(var(--foreground) / 0.55)',
  'hsl(var(--foreground) / 0.25)',
];

/**
 * Gelir Dağılımı kartı.
 *
 * Eski sürüm: yatay grid `[200px_1fr]` — kart 1/3 sütundayken (lg:col-span-1)
 * sağdaki etiket+yüzde+TL kolonu daralıp taşıyordu, kullanıcı ancak %67 zoom
 * out ile sığdırıyordu.
 *
 * Yeni sürüm: dikey akış. Donut üstte (max-w-[220px] merkezde), liste altta
 * her satır kendi alanı. Tüm sütun genişliklerinde sığar.
 */
export function RevenueDonut({ data }: { data: DistDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-5 lg:p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-base font-semibold">Gelir Dağılımı</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Toplam havuzun parçaları
        </p>
      </div>

      {/* Donut — kartın genişliğine göre ortalanır, max 220px */}
      <div className="relative mx-auto h-44 w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={82}
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number | string) => formatTL(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Merkez total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Havuz
          </span>
          <span className="text-base font-bold tabular-nums">
            {formatTL(total)}
          </span>
        </div>
      </div>

      {/* Liste — donut altında, her satır tam genişlik */}
      <ul className="mt-4 space-y-1.5">
        {data.map((d, i) => {
          const ratio = total > 0 ? d.value / total : 0;
          return (
            <li
              key={d.key}
              className="rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                  aria-hidden
                />
                <span className="flex-1 min-w-0 text-xs font-semibold truncate">
                  {d.label}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                  %{Math.round(ratio * 100)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-base font-bold tabular-nums">
                  {formatTL(d.value)}
                </span>
                <div className="ml-auto h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-smooth"
                    style={{
                      width: `${Math.max(2, ratio * 100)}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
