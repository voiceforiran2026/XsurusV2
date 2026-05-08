import { create } from 'zustand';
import { broadcast } from '@/lib/broadcast';
import type { ServiceType, RideStatus } from '@/types/domain';

export interface PendingRideOffer {
  id: string;
  serviceType: ServiceType;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  estimatedFare: number;
  riderName: string;
  requestedAt: string;
}

interface DriverState {
  isOnline: boolean;
  togglingOnline: boolean;
  pending: PendingRideOffer[];
  /** Bu sürücünün mevcut sekmesinde "pas geç" dediği ride id'leri (modal'da bir daha gösterme) */
  passedRideIds: Set<string>;
  /** Aktif modal — sürücüye gösterilecek üstteki teklif */
  activeOffer: PendingRideOffer | null;

  setOnline: (next: boolean) => Promise<void>;
  hydrateOnline: () => Promise<void>;
  refreshPending: () => Promise<void>;
  passOffer: (rideId: string) => void;
  acceptOffer: (rideId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  setActiveOffer: (o: PendingRideOffer | null) => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: false,
  togglingOnline: false,
  pending: [],
  passedRideIds: new Set(),
  activeOffer: null,

  setOnline: async (next) => {
    set({ togglingOnline: true });
    try {
      const res = await fetch('/api/driver/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: next }),
      });
      if (res.ok) {
        set({ isOnline: next });
        broadcast({ type: 'driver:online', driverId: 'self', isOnline: next });
        if (next) await get().refreshPending();
        else
          set({ pending: [], activeOffer: null });
      }
    } finally {
      set({ togglingOnline: false });
    }
  },

  hydrateOnline: async () => {
    const res = await fetch('/api/driver/online', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      set({ isOnline: !!data.isOnline });
      if (data.isOnline) await get().refreshPending();
    }
  },

  refreshPending: async () => {
    const res = await fetch('/api/rides/pending', { cache: 'no-store' });
    // Oturum sürücü değilse (örn. admin'e geçildi) polling'i sustur:
    // isOnline=false → usePollingFallback active=false → interval cleanup.
    if (res.status === 401 || res.status === 403) {
      set({ isOnline: false, pending: [], activeOffer: null });
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    const passed = get().passedRideIds;
    const list: PendingRideOffer[] = (data.rides ?? [])
      .filter((r: { id: string }) => !passed.has(r.id))
      .map((r: {
        id: string;
        serviceType: ServiceType;
        pickupAddress: string;
        pickupLat: number;
        pickupLng: number;
        dropoffAddress: string;
        dropoffLat: number;
        dropoffLng: number;
        distanceKm: number;
        estimatedFare: number;
        rider: { fullName: string };
        requestedAt: string;
      }) => ({
        id: r.id,
        serviceType: r.serviceType,
        pickupAddress: r.pickupAddress,
        pickupLat: r.pickupLat,
        pickupLng: r.pickupLng,
        dropoffAddress: r.dropoffAddress,
        dropoffLat: r.dropoffLat,
        dropoffLng: r.dropoffLng,
        distanceKm: r.distanceKm,
        estimatedFare: r.estimatedFare,
        riderName: r.rider.fullName,
        requestedAt: r.requestedAt,
      }));
    set({ pending: list });
    // İlk teklifi modalda göster
    set((s) => ({
      activeOffer: s.activeOffer ?? list[0] ?? null,
    }));
  },

  passOffer: (rideId) => {
    set((s) => {
      const passed = new Set(s.passedRideIds);
      passed.add(rideId);
      const remaining = s.pending.filter((p) => p.id !== rideId);
      return {
        passedRideIds: passed,
        pending: remaining,
        activeOffer:
          s.activeOffer?.id === rideId ? remaining[0] ?? null : s.activeOffer,
      };
    });
  },

  acceptOffer: async (rideId) => {
    const res = await fetch(`/api/rides/${rideId}/accept`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Başka biri almışsa veya artık alınamıyor → listeden çıkar
      get().passOffer(rideId);
      return { ok: false, error: data.error ?? 'Yolculuk alınamadı' };
    }
    broadcast({
      type: 'ride:accepted',
      rideId,
      driverId: 'self',
    });
    set({ activeOffer: null });
    return { ok: true };
  },

  setActiveOffer: (activeOffer) => set({ activeOffer }),
}));
