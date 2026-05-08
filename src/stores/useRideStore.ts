import { create } from 'zustand';
import { broadcast } from '@/lib/broadcast';
import { estimateRoadDistanceKm } from '@/lib/geo';
import { calculateFare } from '@/lib/pricing';
import type { ServiceType, PaymentMethod, RideStatus } from '@/types/domain';

export interface RidePoint {
  placeId?: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Quote {
  distanceKm: number;
  estimatedFare: number;
  eta: number;
}

export interface ActiveRideSummary {
  id: string;
  status: RideStatus;
  serviceType: ServiceType;
  estimatedFare: number;
  finalFare?: number | null;
  pickupAddress: string;
  dropoffAddress: string;
  driverName?: string | null;
}

interface RideState {
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  pickup: RidePoint | null;
  dropoff: RidePoint | null;
  quote: Quote | null;
  quoting: boolean;
  submitting: boolean;
  activeRide: ActiveRideSummary | null;

  setServiceType: (s: ServiceType) => void;
  setPaymentMethod: (p: PaymentMethod) => void;
  setPickup: (p: RidePoint | null) => void;
  setDropoff: (p: RidePoint | null) => void;
  swap: () => void;
  reset: () => void;

  refreshQuote: () => Promise<void>;
  submitRide: () => Promise<{ ok: true; rideId: string } | { ok: false; error: string }>;
  setActiveRide: (r: ActiveRideSummary | null) => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  serviceType: 'RIDE',
  paymentMethod: 'CARD',
  pickup: null,
  dropoff: null,
  quote: null,
  quoting: false,
  submitting: false,
  activeRide: null,

  setServiceType: (serviceType) => {
    set({ serviceType });
    void get().refreshQuote();
  },
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPickup: (pickup) => {
    set({ pickup });
    void get().refreshQuote();
  },
  setDropoff: (dropoff) => {
    set({ dropoff });
    void get().refreshQuote();
  },
  swap: () => {
    const { pickup, dropoff } = get();
    set({ pickup: dropoff, dropoff: pickup });
    void get().refreshQuote();
  },
  reset: () =>
    set({
      pickup: null,
      dropoff: null,
      quote: null,
      quoting: false,
      submitting: false,
    }),

  refreshQuote: async () => {
    const { pickup, dropoff, serviceType } = get();
    if (!pickup || !dropoff) {
      set({ quote: null, quoting: false });
      return;
    }
    // Saf hesap — sunucuya gitmeye gerek yok. Eskiden her tuş vuruşu
    // sonrası /api/rides/quote'a fetch atılıyordu (network gecikmesi
    // = ücret kartının görünmesi için 100-300ms+).
    const distanceKmRaw = estimateRoadDistanceKm(pickup, dropoff);
    const distanceKm = Math.round(distanceKmRaw * 10) / 10;
    const estimatedFare = calculateFare(serviceType, distanceKmRaw);
    const eta = Math.max(2, Math.round(distanceKmRaw * 2.5));
    set({
      quote: { distanceKm, estimatedFare, eta },
      quoting: false,
    });
  },

  submitRide: async () => {
    const { pickup, dropoff, serviceType, paymentMethod } = get();
    if (!pickup || !dropoff)
      return { ok: false, error: 'Kalkış ve varış noktası gerekli' };
    set({ submitting: true });
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, paymentMethod, pickup, dropoff }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? 'Talep oluşturulamadı' };
      }
      // Sürücü sekmesinin gelen talebi anında görmesi için broadcast
      broadcast({
        type: 'ride:new',
        rideId: data.ride.id,
        serviceType,
      });
      return { ok: true, rideId: data.ride.id };
    } catch {
      return { ok: false, error: 'Ağ hatası' };
    } finally {
      set({ submitting: false });
    }
  },

  setActiveRide: (activeRide) => set({ activeRide }),
}));
