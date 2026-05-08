'use client';

import { CreditCard, Sparkles } from 'lucide-react';
import type { PaymentMethod } from '@/types/domain';
import { cn } from '@/lib/utils';
import { formatTL } from '@/lib/format';

interface PaymentMethodToggleProps {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
  chipBalance: number;
  estimatedFare?: number;
}

export function PaymentMethodToggle({
  value,
  onChange,
  chipBalance,
  estimatedFare,
}: PaymentMethodToggleProps) {
  const chipDisabled = chipBalance <= 0;
  const chipUsed = estimatedFare
    ? Math.min(estimatedFare, chipBalance)
    : Math.min(chipBalance, 0);

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
        Ödeme Yöntemi
      </p>
      <div role="tablist" className="relative inline-flex w-full rounded-full bg-muted p-1.5">
        <Option
          icon={<CreditCard className="h-4 w-4" />}
          label="Kart"
          active={value === 'CARD'}
          onClick={() => onChange('CARD')}
        />
        <Option
          icon={<Sparkles className="h-4 w-4" />}
          label={
            chipBalance > 0
              ? `Chip (${formatTL(chipBalance)})`
              : 'Chip (0 ₺)'
          }
          active={value === 'CHIP'}
          disabled={chipDisabled}
          onClick={() => !chipDisabled && onChange('CHIP')}
        />
      </div>
      {value === 'CHIP' && estimatedFare !== undefined && (
        <p className="text-[11px] text-muted-foreground px-1 animate-fade-in">
          Bakiyeden{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {formatTL(chipUsed)}
          </span>{' '}
          kullanılacak{' '}
          {chipUsed < estimatedFare && (
            <>
              · kalan{' '}
              <span className="font-semibold text-foreground tabular-nums">
                {formatTL(estimatedFare - chipUsed)}
              </span>{' '}
              kartla
            </>
          )}
        </p>
      )}
    </div>
  );
}

function Option({
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors duration-200',
        active && !disabled
          ? 'text-foreground'
          : disabled
            ? 'text-muted-foreground/50 cursor-not-allowed'
            : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {active && !disabled && (
        <span className="absolute inset-0 rounded-full bg-background shadow-sm transition-all duration-200" />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
