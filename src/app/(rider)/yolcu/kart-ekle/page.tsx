import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RiderShell } from '@/components/layout/RiderShell';
import { AddCardForm } from '@/components/payment/AddCardForm';

export const metadata: Metadata = { title: 'Kart Ekle' };

export default function KartEklePage() {
  return (
    <RiderShell>
      <div className="px-5 py-4 max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/yolcu/cuzdan"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cüzdan
          </Link>
          <h1 className="text-base font-semibold">Kart Ekle</h1>
          <span className="w-12" aria-hidden />
        </div>
        <AddCardForm />
      </div>
    </RiderShell>
  );
}
