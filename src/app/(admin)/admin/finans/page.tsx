import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTL, formatDateTime } from '@/lib/format';
import type { LedgerType } from '@/types/domain';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Finans' };

const LEDGER_LABEL: Record<LedgerType, string> = {
  RIDE_INFLOW: 'Yolculuk Geliri',
  DRIVER_PAYOUT: 'Sürücü Hak Edişi',
  CHIP_RESERVE: 'Chip Karşılığı',
  COMMISSION: 'Sistem Komisyonu',
  CHIP_REDEMPTION: 'Chip Kullanımı',
  PAYOUT_SETTLEMENT: 'Toplu Ödeme',
};

const PAGE_SIZE = 30;

const FILTERS: Array<{ key?: LedgerType; label: string }> = [
  { label: 'Tümü' },
  { key: 'RIDE_INFLOW', label: 'Gelir' },
  { key: 'DRIVER_PAYOUT', label: 'Sürücü' },
  { key: 'CHIP_RESERVE', label: 'Chip' },
  { key: 'COMMISSION', label: 'Komisyon' },
  { key: 'PAYOUT_SETTLEMENT', label: 'Dağıtım' },
];

export default async function AdminFinansPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const type = searchParams.type as LedgerType | undefined;

  const where = type ? { type } : {};
  const [items, total] = await Promise.all([
    db.poolLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.poolLedger.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Finans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tüm havuz hareketleri kronolojik olarak.
        </p>
      </div>

      <Card className="p-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={`?${f.key ? `type=${f.key}` : ''}`}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              type === f.key || (!type && !f.key)
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </Link>
        ))}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <Th>Tarih</Th>
                <Th>Tür</Th>
                <Th>Açıklama</Th>
                <Th>Yolculuk</Th>
                <Th className="text-right">Tutar</Th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Eşleşen kayıt yok
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const isOutflow =
                    it.type === 'DRIVER_PAYOUT' ||
                    it.type === 'CHIP_RESERVE' ||
                    it.type === 'PAYOUT_SETTLEMENT';
                  return (
                    <tr key={it.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatDateTime(it.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            it.type === 'RIDE_INFLOW'
                              ? 'bg-foreground text-background'
                              : it.type === 'COMMISSION'
                                ? 'bg-foreground/10 text-foreground'
                                : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {LEDGER_LABEL[it.type as LedgerType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{it.description}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {it.rideId ? `…${it.rideId.slice(-6)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        <span
                          className={cn(
                            isOutflow ? 'text-muted-foreground' : 'text-foreground',
                          )}
                        >
                          {isOutflow ? '−' : '+'}
                          {formatTL(it.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
          <span>
            Toplam{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {total}
            </span>{' '}
            hareket · Sayfa {page} / {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page <= 1}
              aria-disabled={page <= 1}
            >
              <Link href={`?${type ? `type=${type}&` : ''}page=${Math.max(1, page - 1)}`}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              aria-disabled={page >= totalPages}
            >
              <Link href={`?${type ? `type=${type}&` : ''}page=${Math.min(totalPages, page + 1)}`}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className ?? ''}`}
    >
      {children}
    </th>
  );
}
