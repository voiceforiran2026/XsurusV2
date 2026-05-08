import Link from 'next/link';
import { Activity, Star, ArrowRight, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatTL } from '@/lib/format';

export interface ActiveDriverRow {
  userId: string;
  fullName: string;
  vehicleModel: string;
  plateNumber: string;
  rating: number;
  unpaidBalance: number;
  totalRides: number;
}

interface ActiveDriversCardProps {
  drivers: ActiveDriverRow[];
  totalOnline: number;
  totalDrivers: number;
}

/**
 * Admin dashboard'da sağ tarafta yer alan canlı sürücü paneli.
 * Online sürücülerin özet kartlarını listeler; her satırda araç, plaka, puan
 * ve bekleyen ödeme gösterilir. Boş durumda nazik bir state.
 */
export function ActiveDriversCard({
  drivers,
  totalOnline,
  totalDrivers,
}: ActiveDriversCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 lg:p-6 border-b">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Aktif Sürücüler
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-semibold text-foreground tabular-nums">
              {totalOnline}
            </span>{' '}
            çevrimiçi · {totalDrivers} kayıtlı
          </p>
        </div>
        <Link
          href="/admin/suruculer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Tümü
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {drivers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
            <Power className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium">Çevrimiçi sürücü yok</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sürücüler online olunca burada listelenir.
          </p>
        </div>
      ) : (
        <ul className="divide-y flex-1">
          {drivers.map((d) => {
            const initials = d.fullName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            return (
              <li
                key={d.userId}
                className="flex items-center gap-3 p-3 lg:p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                    {initials}
                  </div>
                  <span
                    className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"
                    aria-label="Çevrimiçi"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">
                      {d.fullName}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums shrink-0">
                      <Star className="h-2.5 w-2.5 fill-current text-foreground" />
                      {d.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {d.vehicleModel}{' '}
                    <span className="font-mono">· {d.plateNumber}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Bekleyen
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {formatTL(d.unpaidBalance)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t p-3 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Activity className="h-3 w-3" />
          Canlı durum
        </span>
        <Link
          href="/admin/dispatch"
          className="font-medium text-foreground hover:underline"
        >
          Mission Control →
        </Link>
      </div>
    </Card>
  );
}
