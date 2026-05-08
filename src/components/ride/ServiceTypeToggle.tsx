'use client';

import { Car, Package } from 'lucide-react';
import type { ServiceType } from '@/types/domain';
import { cn } from '@/lib/utils';

interface ServiceTypeToggleProps {
  value: ServiceType;
  onChange: (v: ServiceType) => void;
  className?: string;
}

const OPTIONS: { value: ServiceType; label: string; icon: typeof Car }[] = [
  { value: 'RIDE', label: 'Ride', icon: Car },
  { value: 'GO', label: 'Go', icon: Package },
];

export function ServiceTypeToggle({
  value,
  onChange,
  className,
}: ServiceTypeToggleProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'relative inline-flex items-center rounded-full bg-muted p-1.5 w-full',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ease-smooth',
              active
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-full bg-background shadow-sm transition-all duration-200" />
            )}
            <opt.icon className="relative h-4 w-4" />
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
