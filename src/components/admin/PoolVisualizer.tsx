'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Car,
  Sparkles,
  Banknote,
  ArrowDown,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/admin/AnimatedCounter';
import { MoneyFlowAnim } from '@/components/animations/MoneyFlowAnim';
import { useBroadcastEvent } from '@/hooks/useBroadcastEvent';
import { broadcast, isBroadcastSupported } from '@/lib/broadcast';
import { formatTL } from '@/lib/format';
import { useRouter } from 'next/navigation';

interface PoolSnapshot {
  totalInflow: number;
  totalDriverPayout: number;
  totalChipReserve: number;
  totalCommission: number;
  totalSettlements: number;
  driverUnpaid: number;
  driverPaid: number;
  driverTotalEarnings: number;
  driverCount: number;
}

const POLL_MS = 4000;

export function PoolVisualizer({ initial }: { initial: PoolSnapshot }) {
  const router = useRouter();
  const [snap, setSnap] = React.useState<PoolSnapshot>(initial);
  const [inflowRunId, setInflowRunId] = React.useState<number | null>(null);
  const [payoutRunId, setPayoutRunId] = React.useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [result, setResult] = React.useState<null | {
    driverCount: number;
    totalPaid: number;
  }>(null);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const res = await fetch('/api/admin/pool', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setSnap(data);
    }
  }, []);

  // Yolculuk tamamlandı event'i → havuza akış animasyonu + refresh
  useBroadcastEvent(
    (e) => {
      if (e.type === 'ride:completed') {
        setInflowRunId(Date.now());
        setTimeout(() => void refresh(), 350);
      } else if (e.type === 'pool:payout') {
        setPayoutRunId(Date.now());
        setTimeout(() => void refresh(), 350);
      }
    },
    [refresh],
  );

  // Polling sadece BroadcastChannel desteklenmediğinde.
  // Aksi halde ride:completed / pool:payout event'leri yeterince hızlı.
  React.useEffect(() => {
    if (isBroadcastSupported()) return;
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const distribute = async () => {
    setError(null);
    setPaying(true);
    try {
      const res = await fetch('/api/admin/pool/payout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Dağıtım başarısız');
        return;
      }
      setResult({
        driverCount: data.driverCount,
        totalPaid: data.totalPaid,
      });
      setPayoutRunId(Date.now());
      broadcast({
        type: 'pool:payout',
        totalAmount: data.totalPaid,
      });
      // Başarı feedback'i kısa, sonra hızlıca kapat ve refresh
      setTimeout(() => {
        setConfirmOpen(false);
        setResult(null);
        void refresh();
        router.refresh();
      }, 1100);
    } finally {
      setPaying(false);
    }
  };

  const settledTotal = snap.totalInflow - snap.totalDriverPayout - snap.totalCommission - snap.totalChipReserve;

  return (
    <div className="space-y-5">
      {/* Üst hero — toplam havuz */}
      <Card className="relative overflow-hidden bg-canvas text-white border-canvas p-6 lg:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1),_transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.04),_transparent_70%)] pointer-events-none" />
        <MoneyFlowAnim runId={inflowRunId} direction="in" count={10} duration={1.4} />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
            <PiggyBank className="h-3 w-3" />
            Sistem Havuzu
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="heading-display text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums">
              <AnimatedCounter to={snap.totalInflow} format={(n) => formatTL(n)} />
            </span>
          </div>
          <p className="text-sm text-white/60 mt-2 max-w-lg">
            Tüm zamanlar boyunca havuza giren toplam ücret. Aşağıdaki 3 alt
            kovaya dağılır.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <HeroStat label="Sürücü Hak Edişi" value={snap.totalDriverPayout} pct={snap.totalInflow > 0 ? snap.totalDriverPayout / snap.totalInflow : 0} />
            <HeroStat label="Sistem Komisyonu" value={snap.totalCommission} pct={snap.totalInflow > 0 ? snap.totalCommission / snap.totalInflow : 0} />
            <HeroStat label="Yolcuya Chip" value={snap.totalChipReserve} pct={snap.totalInflow > 0 ? snap.totalChipReserve / snap.totalInflow : 0} />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <BucketCard
          icon={<Car className="h-4 w-4" />}
          label="Sürücü Hak Edişleri"
          big={snap.driverUnpaid}
          bigLabel="Bekleyen"
          extra={[
            { k: 'Ödenen', v: snap.driverPaid },
            { k: 'Toplam Hak Ediş', v: snap.driverTotalEarnings },
          ]}
          ctaSlot={
            snap.driverUnpaid > 0 ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setConfirmOpen(true)}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Şoför Ödemelerini Dağıt
              </Button>
            ) : (
              <div className="text-center text-xs text-muted-foreground bg-muted rounded-xl py-3">
                Bekleyen ödeme yok
              </div>
            )
          }
          flowSlot={
            <MoneyFlowAnim
              runId={payoutRunId}
              direction="out"
              count={16}
              duration={1.8}
            />
          }
        />

        <BucketCard
          icon={<PiggyBank className="h-4 w-4" />}
          label="Sistem Komisyonu"
          big={snap.totalCommission}
          bigLabel="Net Sistem Geliri"
          extra={[
            { k: 'Yüzde', v: snap.totalInflow > 0 ? (snap.totalCommission / snap.totalInflow) * 100 : 0, isPercent: true },
            { k: 'Kayıt Sayısı', v: snap.driverCount, isInt: true },
          ]}
          highlight
        />

        <BucketCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Chip Karşılığı"
          big={snap.totalChipReserve}
          bigLabel="Yolculara Verilen"
          extra={[
            { k: 'Yüzde', v: snap.totalInflow > 0 ? (snap.totalChipReserve / snap.totalInflow) * 100 : 0, isPercent: true },
          ]}
        />
      </div>

      {/* Dialog: Ödeme onayı */}
      <Dialog open={confirmOpen} onOpenChange={(o) => !paying && setConfirmOpen(o)}>
        <DialogContent className="max-w-md">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background"
              >
                <CheckCircle2 className="h-7 w-7" />
              </motion.div>
              <DialogTitle>Ödeme tamamlandı</DialogTitle>
              <DialogDescription className="mt-2">
                <span className="font-semibold text-foreground">
                  {result.driverCount}
                </span>{' '}
                sürücüye toplam{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatTL(result.totalPaid)}
                </span>{' '}
                aktarıldı.
              </DialogDescription>
            </motion.div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shrink-0">
                  <Banknote className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle>Şoför Ödemelerini Dağıt</DialogTitle>
                  <DialogDescription className="mt-1.5">
                    Bekleyen{' '}
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatTL(snap.driverUnpaid)}
                    </span>{' '}
                    tüm sürücülerin hesaplarına aktarılacak. Bu işlem geri
                    alınamaz.
                  </DialogDescription>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <DialogFooter className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  disabled={paying}
                >
                  Vazgeç
                </Button>
                <Button onClick={distribute} disabled={paying}>
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  {paying ? 'Aktarılıyor…' : 'Onayla ve Dağıt'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeroStat({
  label,
  value,
  pct,
}: {
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
        {label}
      </div>
      <div className="text-base md:text-lg font-bold mt-1 tabular-nums">
        <AnimatedCounter to={value} format={(n) => formatTL(n)} />
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct * 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="text-[10px] text-white/50 mt-1 tabular-nums">
        %{Math.round(pct * 100)}
      </div>
    </div>
  );
}

interface BucketCardProps {
  icon: React.ReactNode;
  label: string;
  big: number;
  bigLabel: string;
  extra: Array<{
    k: string;
    v: number;
    isPercent?: boolean;
    isInt?: boolean;
  }>;
  ctaSlot?: React.ReactNode;
  flowSlot?: React.ReactNode;
  highlight?: boolean;
}

function BucketCard({
  icon,
  label,
  big,
  bigLabel,
  extra,
  ctaSlot,
  flowSlot,
  highlight,
}: BucketCardProps) {
  return (
    <Card
      className={`relative overflow-hidden p-5 ${
        highlight ? 'bg-foreground/[0.02] ring-1 ring-foreground/10' : ''
      }`}
    >
      {flowSlot}
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/5">
            {icon}
          </div>
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {bigLabel}
        </p>
        <p className="text-3xl font-bold mt-1 tabular-nums">
          <AnimatedCounter to={big} format={(n) => formatTL(n)} />
        </p>
        <div className="mt-4 space-y-2 pt-3 border-t">
          {extra.map((e) => (
            <div key={e.k} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{e.k}</span>
              <span className="font-semibold tabular-nums">
                {e.isPercent
                  ? `%${e.v.toFixed(1)}`
                  : e.isInt
                    ? e.v.toString()
                    : formatTL(e.v)}
              </span>
            </div>
          ))}
        </div>
        {ctaSlot && <div className="mt-4">{ctaSlot}</div>}
      </div>
    </Card>
  );
}
