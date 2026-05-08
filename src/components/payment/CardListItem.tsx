'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CardBrand } from '@/lib/cards';
import { brandLabel } from '@/lib/cards';
import { maskCard } from '@/lib/format';
import { cn } from '@/lib/utils';

interface CardListItemProps {
  id: string;
  brand: CardBrand;
  last4: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

export function CardListItem({
  id,
  brand,
  last4,
  cardholderName,
  expiryMonth,
  expiryYear,
  isDefault,
  onDelete,
  onSetDefault,
}: CardListItemProps) {
  const [busy, setBusy] = React.useState<null | 'delete' | 'default'>(null);

  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={cn(
          'p-4 flex items-center gap-4 transition-colors duration-200',
          isDefault ? 'border-foreground/40' : '',
        )}
      >
        <div className="relative h-9 w-14 rounded-md bg-canvas text-white flex items-center justify-center font-bold text-[10px] tracking-wider shrink-0">
          {brand === 'VISA' ? 'VISA' : brand === 'MASTERCARD' ? 'MC' : brand === 'AMEX' ? 'AMEX' : brand === 'TROY' ? 'TROY' : '••'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium font-mono truncate">
              {maskCard(last4)}
            </p>
            {isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5">
                <Star className="h-2.5 w-2.5 fill-current" />
                Varsayılan
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {cardholderName} · {String(expiryMonth).padStart(2, '0')}/{String(expiryYear).padStart(2, '0')} · {brandLabel(brand)}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {!isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Varsayılan yap"
              disabled={!!busy}
              onClick={async () => {
                setBusy('default');
                try {
                  await onSetDefault(id);
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === 'default' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Star className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Kartı sil"
            disabled={!!busy}
            onClick={async () => {
              if (!confirm('Bu kartı silmek istediğinize emin misiniz?')) return;
              setBusy('delete');
              try {
                await onDelete(id);
              } finally {
                setBusy(null);
              }
            }}
          >
            {busy === 'delete' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
