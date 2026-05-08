import type { Metadata } from 'next';
import { Star, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { formatTL } from '@/lib/format';

export const metadata: Metadata = { title: 'Yolcular' };

export default async function AdminYolcularPage() {
  const riders = await db.user.findMany({
    where: { role: 'RIDER' },
    include: { riderProfile: true, chipBalance: true },
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Yolcular</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {riders.length} kayıtlı yolcu
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <Th>Yolcu</Th>
                <Th>Telefon</Th>
                <Th className="text-right">Puan</Th>
                <Th className="text-right">Yolculuk</Th>
                <Th className="text-right">Harcama</Th>
                <Th className="text-right">Chip Bakiye</Th>
                <Th className="text-right">Toplam Kazanım</Th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => {
                const p = r.riderProfile;
                const c = r.chipBalance;
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                          {r.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{r.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {p?.rating.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p?.totalRides ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatTL(p?.totalSpent ?? 0)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {formatTL(c?.balance ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatTL(c?.lifetimeEarned ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className ?? ''}`}>
      {children}
    </th>
  );
}
