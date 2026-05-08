'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, CreditCard, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChipBalanceCard } from './ChipBalanceCard';
import { CardListItem } from './CardListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { formatTL, formatRelative } from '@/lib/format';
import { txTypeLabel } from '@/lib/chip';
import type { CardBrand } from '@/lib/cards';
import type { ChipTxType } from '@/types/domain';

interface PaymentCardData {
  id: string;
  brand: CardBrand;
  last4: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface ChipTxData {
  id: string;
  amount: number;
  type: ChipTxType;
  description: string;
  createdAt: string;
}

interface WalletPanelProps {
  initialBalance: { balance: number; lifetimeEarned: number; lifetimeSpent: number };
  initialCards: PaymentCardData[];
  initialTransactions: ChipTxData[];
}

export function WalletPanel({
  initialBalance,
  initialCards,
  initialTransactions,
}: WalletPanelProps) {
  const [cards, setCards] = React.useState<PaymentCardData[]>(initialCards);
  const balance = initialBalance;
  const transactions = initialTransactions;

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/me/cards/${id}`, { method: 'DELETE' });
    if (res.ok) {
      // Yerel listeyi yenile
      const fresh = await fetch('/api/me/cards', { cache: 'no-store' });
      if (fresh.ok) {
        const data = await fresh.json();
        setCards(data.cards);
      }
    }
  };

  const onSetDefault = async (id: string) => {
    const res = await fetch(`/api/me/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      setCards((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === id })),
      );
    }
  };

  return (
    <div className="space-y-5">
      <ChipBalanceCard
        balance={balance.balance}
        lifetimeEarned={balance.lifetimeEarned}
        lifetimeSpent={balance.lifetimeSpent}
      />

      <section>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Kartlarım
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/yolcu/kart-ekle">
              <Plus className="h-3.5 w-3.5" />
              Kart Ekle
            </Link>
          </Button>
        </div>
        {cards.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-5 w-5" />}
            title="Henüz kart yok"
            description="Hızlı ödeme için bir kredi/banka kartı ekleyin."
            action={
              <Button asChild>
                <Link href="/yolcu/kart-ekle">
                  <Plus className="h-4 w-4" />
                  Kart Ekle
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {cards.map((c) => (
              <CardListItem
                key={c.id}
                {...c}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Chip Hareketleri
          </h2>
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="Henüz chip hareketi yok"
            description="Tamamlanan her yolculukta ücretin %10'u kadar chip kazanırsın."
          />
        ) : (
          <Card className="divide-y">
            {transactions.map((t) => {
              const positive = t.amount >= 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {txTypeLabel(t.type)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.description} · {formatRelative(t.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      positive ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    {positive ? '+' : ''}
                    {formatTL(t.amount)}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}
