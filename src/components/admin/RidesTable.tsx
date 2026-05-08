'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  MapPin,
  Clock,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTL, formatDistance, formatDateTime } from '@/lib/format';
import type { RideStatus, ServiceType } from '@/types/domain';
import { cn } from '@/lib/utils';

export interface AdminRideRow {
  id: string;
  serviceType: ServiceType;
  status: RideStatus;
  riderName: string;
  driverName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  finalFare: number | null;
  estimatedFare: number;
  driverEarning: number | null;
  systemCommission: number | null;
  chipReward: number | null;
  paymentMethod: string;
  requestedAt: string;
  completedAt: string | null;
}

const STATUS_LABELS: Record<RideStatus, string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Onaylandı',
  EN_ROUTE_TO_PICKUP: 'Yolda',
  IN_PROGRESS: 'Sürüyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const STATUSES: RideStatus[] = [
  'PENDING',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

interface RidesTableProps {
  initialRides: AdminRideRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters: { status?: string; q?: string };
}

export function RidesTable({
  initialRides,
  totalCount,
  page,
  pageSize,
  filters,
}: RidesTableProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [drawer, setDrawer] = React.useState<AdminRideRow | null>(null);
  const [q, setQ] = React.useState(filters.q ?? '');

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const updateParams = (next: Record<string, string | undefined>) => {
    const usp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v && v.length > 0) usp.set(k, v);
      else usp.delete(k);
    }
    router.push(`?${usp.toString()}`);
  };

  const onStatus = (s: string | undefined) => {
    updateParams({ status: s, page: '1' });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: q.trim(), page: '1' });
  };

  const goPage = (p: number) => updateParams({ page: String(p) });

  return (
    <div className="space-y-3">
      <Card className="p-3 flex flex-col md:flex-row gap-2 md:items-center">
        <form onSubmit={onSearch} className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Adres, yolcu veya sürücü ara…"
            className="pl-9 h-10"
          />
        </form>
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <FilterChip
            active={!filters.status}
            onClick={() => onStatus(undefined)}
            label="Tümü"
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={filters.status === s}
              onClick={() => onStatus(s)}
              label={STATUS_LABELS[s]}
            />
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <Th>Tarih</Th>
                <Th>Hizmet</Th>
                <Th>Yolcu</Th>
                <Th>Sürücü</Th>
                <Th>Rota</Th>
                <Th className="text-right">Mesafe</Th>
                <Th className="text-right">Ücret</Th>
                <Th>Durum</Th>
              </tr>
            </thead>
            <tbody>
              {initialRides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Filter className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Eşleşen kayıt yok</p>
                  </td>
                </tr>
              ) : (
                initialRides.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDrawer(r)}
                    className="border-t cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Td>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDateTime(r.requestedAt)}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {r.serviceType === 'GO' ? 'Go' : 'Ride'}
                      </span>
                    </Td>
                    <Td className="font-medium">{r.riderName}</Td>
                    <Td>{r.driverName ?? <span className="text-muted-foreground">—</span>}</Td>
                    <Td>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px] inline-block">
                        {r.pickupAddress.split(',')[0]} → {r.dropoffAddress.split(',')[0]}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">{formatDistance(r.distanceKm)}</Td>
                    <Td className="text-right tabular-nums font-semibold">
                      {formatTL(r.finalFare ?? r.estimatedFare)}
                    </Td>
                    <Td>
                      <StatusPill status={r.status} />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
          <span>
            Toplam{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {totalCount}
            </span>{' '}
            kayıt · Sayfa {page} / {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <RideDetailDrawer ride={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
        active
          ? 'bg-foreground text-background'
          : 'bg-muted text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: RideStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        status === 'COMPLETED'
          ? 'bg-foreground text-background'
          : status === 'CANCELLED'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground',
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  );
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

function RideDetailDrawer({
  ride,
  onClose,
}: {
  ride: AdminRideRow | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {ride && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-soft-lg overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold">Yolculuk Detayı</h3>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-mono text-xs">{ride.id}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Durum</p>
                <StatusPill status={ride.status} />
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Rota</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background mt-0.5">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <p className="text-sm flex-1 min-w-0">{ride.pickupAddress}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <p className="text-sm flex-1 min-w-0">{ride.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Yolcu" value={ride.riderName} />
                <Stat label="Sürücü" value={ride.driverName ?? '—'} />
                <Stat label="Mesafe" value={formatDistance(ride.distanceKm)} />
                <Stat label="Hizmet" value={ride.serviceType === 'GO' ? 'X Go' : 'X Ride'} />
                <Stat
                  label="Talep"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(ride.requestedAt)}
                    </span>
                  }
                />
                {ride.completedAt && (
                  <Stat label="Tamamlandı" value={formatDateTime(ride.completedAt)} />
                )}
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Wallet className="h-3 w-3" />
                  Finansal
                </p>
                <Row label="Toplam Ücret" value={formatTL(ride.finalFare ?? ride.estimatedFare)} bold />
                {ride.driverEarning !== null && (
                  <Row label="Sürücü Hak Edişi (%75)" value={formatTL(ride.driverEarning)} />
                )}
                {ride.systemCommission !== null && (
                  <Row label="Sistem Komisyonu (%15)" value={formatTL(ride.systemCommission)} />
                )}
                {ride.chipReward !== null && (
                  <Row label="Yolcuya Chip (%10)" value={formatTL(ride.chipReward)} />
                )}
                <Row label="Ödeme" value={ride.paymentMethod === 'CHIP' ? 'Chip' : 'Kart'} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('tabular-nums', bold ? 'font-bold' : 'font-medium')}>
        {value}
      </span>
    </div>
  );
}
