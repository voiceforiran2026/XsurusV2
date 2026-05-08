import Link from 'next/link';
import {
  PiggyBank,
  Car,
  Sparkles,
  ArrowRight,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatTL } from '@/lib/format';
import { PRICING_CONFIG } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface PoolHealthData {
  totalInflow: number;
  driverPayoutTotal: number;
  systemCommissionTotal: number;
  chipReserveTotal: number;
  driverUnpaid: number;
  driverPaid: number;
}

/**
 * Komisyon ve havuz dağılımının özet görünümü.
 * Her tamamlanan yolculuğun nereye gittiğini tek bakışta gösterir:
 * - %75 sürücü
 * - %15 sistem komisyonu
 * - %10 yolcu chip karşılığı
 * Ek olarak bekleyen sürücü ödemelerini ve havuz sayfasına kısayolu içerir.
 */
export function PoolHealthCard({ data }: { data: PoolHealthData }) {
  const breakdown = [
    {
      key: 'driver',
      icon: <Car className="h-3.5 w-3.5" />,
      label: 'Sürücü Hak Edişi',
      value: data.driverPayoutTotal,
      pct: PRICING_CONFIG.driverShare,
      tone: 'foreground' as const,
    },
    {
      key: 'commission',
      icon: <PiggyBank className="h-3.5 w-3.5" />,
      label: 'Sistem Komisyonu',
      value: data.systemCommissionTotal,
      pct: PRICING_CONFIG.systemCommission,
      tone: 'highlight' as const,
    },
    {
      key: 'chip',
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: 'Yolcu Chip Karşılığı',
      value: data.chipReserveTotal,
      pct: PRICING_CONFIG.chipReward,
      tone: 'muted' as const,
    },
  ];

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-5 lg:p-6 border-b">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Banknote className="h-4 w-4" />
          Komisyon Dağılımı
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Toplam{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {formatTL(data.totalInflow)}
          </span>{' '}
          gelir nereye gidiyor
        </p>
      </div>

      <div className="flex-1 p-5 lg:p-6 space-y-3.5">
        {breakdown.map((b) => (
          <div key={b.key}>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md',
                  b.tone === 'highlight'
                    ? 'bg-foreground text-background'
                    : 'bg-foreground/5 text-foreground',
                )}
              >
                {b.icon}
              </span>
              <span className="text-xs font-semibold flex-1 truncate">
                {b.label}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0">
                %{Math.round(b.pct * 100)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-700 ease-smooth',
                    b.tone === 'highlight' ? 'bg-foreground' : 'bg-foreground/40',
                  )}
                  style={{ width: `${Math.round(b.pct * 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums shrink-0 w-24 text-right">
                {formatTL(b.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bekleyen sürücü ödemesi callout */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Bekleyen Sürücü Ödemesi
            </p>
            <p className="text-lg font-bold mt-0.5 tabular-nums">
              {formatTL(data.driverUnpaid)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5" />
              Ödenmiş: {formatTL(data.driverPaid)}
            </p>
          </div>
          <Link
            href="/admin/havuz"
            className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-2 text-xs font-semibold whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            Havuz
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
