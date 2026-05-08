import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { RiderShell } from '@/components/layout/RiderShell';
import { WalletPanel } from '@/components/payment/WalletPanel';
import type { CardBrand } from '@/lib/cards';
import type { ChipTxType } from '@/types/domain';

export const metadata: Metadata = { title: 'Cüzdan' };

export default async function CuzdanPage() {
  const user = (await getCurrentUser())!;

  const [chipBalance, cards, transactions] = await Promise.all([
    db.chipBalance.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    }),
    db.paymentCard.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }),
    db.chipTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <RiderShell>
      <div className="px-5 py-4 max-w-md mx-auto">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">Hesabım</p>
          <h1 className="text-xl font-bold">Cüzdan</h1>
        </div>
        <WalletPanel
          initialBalance={{
            balance: chipBalance.balance,
            lifetimeEarned: chipBalance.lifetimeEarned,
            lifetimeSpent: chipBalance.lifetimeSpent,
          }}
          initialCards={cards.map((c) => ({
            id: c.id,
            brand: c.brand as CardBrand,
            last4: c.last4,
            cardholderName: c.cardholderName,
            expiryMonth: c.expiryMonth,
            expiryYear: c.expiryYear,
            isDefault: c.isDefault,
          }))}
          initialTransactions={transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            type: t.type as ChipTxType,
            description: t.description,
            createdAt: t.createdAt.toISOString(),
          }))}
        />
      </div>
    </RiderShell>
  );
}
