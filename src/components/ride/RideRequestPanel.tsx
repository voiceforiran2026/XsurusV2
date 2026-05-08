'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceTypeToggle } from '@/components/ride/ServiceTypeToggle';
import { AddressAutocomplete } from '@/components/ride/AddressAutocomplete';
import { FareEstimateCard } from '@/components/ride/FareEstimateCard';
import { PaymentMethodToggle } from '@/components/ride/PaymentMethodToggle';
import { useRideStore } from '@/stores/useRideStore';

interface RideRequestPanelProps {
  chipBalance?: number;
}

export function RideRequestPanel({ chipBalance = 0 }: RideRequestPanelProps) {
  const router = useRouter();
  const {
    serviceType,
    setServiceType,
    paymentMethod,
    setPaymentMethod,
    pickup,
    dropoff,
    setPickup,
    setDropoff,
    swap,
    quote,
    quoting,
    submitting,
    submitRide,
  } = useRideStore();
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = !!pickup && !!dropoff && !!quote && !submitting;

  const onSubmit = async () => {
    setError(null);
    const r = await submitRide();
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.push(`/yolcu/arama?ride=${r.rideId}`);
  };

  return (
    <div className="space-y-4">
      <ServiceTypeToggle value={serviceType} onChange={setServiceType} />

      <div className="relative space-y-2">
        <AddressAutocomplete
          label="Nereden"
          placeholder="Konumunuzu seçin"
          value={pickup}
          onChange={setPickup}
        />
        <AddressAutocomplete
          label="Nereye"
          placeholder="Hedef adres"
          value={dropoff}
          onChange={setDropoff}
          iconColor="destructive"
        />

        <button
          type="button"
          onClick={swap}
          aria-label="Adresleri değiştir"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-soft hover:bg-muted transition-colors duration-150"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <FareEstimateCard
        distanceKm={quote?.distanceKm}
        estimatedFare={quote?.estimatedFare}
        eta={quote?.eta}
        loading={quoting}
      />

      <PaymentMethodToggle
        value={paymentMethod}
        onChange={setPaymentMethod}
        chipBalance={chipBalance}
        estimatedFare={quote?.estimatedFare}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gönderiliyor…
          </>
        ) : (
          <>
            Hizmet Bul
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
