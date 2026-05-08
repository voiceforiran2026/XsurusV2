import { Search, CheckCircle2, Car, Flag } from 'lucide-react';
import type { RideStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

interface Step {
  status: RideStatus | RideStatus[];
  label: string;
  icon: typeof Search;
  description: string;
}

/**
 * Yolcu perspektifi — yolcu kendi yolculuğunu izlerken görür.
 */
const RIDER_STEPS: Step[] = [
  {
    status: ['PENDING'],
    label: 'Sürücü aranıyor',
    icon: Search,
    description: 'En yakın sürücü size atanıyor…',
  },
  {
    status: ['ACCEPTED', 'EN_ROUTE_TO_PICKUP'],
    label: 'Sürücü yolda',
    icon: Car,
    description: 'Sürücünüz size doğru ilerliyor.',
  },
  {
    status: ['IN_PROGRESS'],
    label: 'Yolculuk başladı',
    icon: Flag,
    description: 'Hedefe doğru yola çıkıldı.',
  },
  {
    status: ['COMPLETED'],
    label: 'Tamamlandı',
    icon: CheckCircle2,
    description: 'Yolculuğunuz tamamlandı.',
  },
];

/**
 * Sürücü perspektifi — sürücü aktif yolculuk ekranında görür.
 * Aynı 4 aşamayı sürücünün gözünden anlatır.
 */
const DRIVER_STEPS: Step[] = [
  {
    status: ['PENDING'],
    label: 'Talep alındı',
    icon: Search,
    description: 'Yolcuya yönelmeye hazırlanın.',
  },
  {
    status: ['ACCEPTED', 'EN_ROUTE_TO_PICKUP'],
    label: 'Yolcuya gidiliyor',
    icon: Car,
    description: 'Kalkış noktasına ilerliyorsunuz.',
  },
  {
    status: ['IN_PROGRESS'],
    label: 'Yolculuk sürüyor',
    icon: Flag,
    description: 'Varış noktasına doğru sürüyorsunuz.',
  },
  {
    status: ['COMPLETED'],
    label: 'Tamamlandı',
    icon: CheckCircle2,
    description: 'Yolculuk başarıyla tamamlandı.',
  },
];

function activeIndex(steps: Step[], status: RideStatus): number {
  return steps.findIndex((s) =>
    Array.isArray(s.status) ? s.status.includes(status) : s.status === status,
  );
}

export function RideStatusFlow({
  status,
  perspective = 'rider',
}: {
  status: RideStatus;
  perspective?: 'rider' | 'driver';
}) {
  const steps = perspective === 'driver' ? DRIVER_STEPS : RIDER_STEPS;
  const idx = activeIndex(steps, status);
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const reached = i <= idx;
        const isCurrent = i === idx;
        return (
          <div
            key={step.label}
            className={cn(
              'flex items-start gap-4 transition-opacity duration-300',
              reached ? 'opacity-100' : 'opacity-40',
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300',
                  reached
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <step.icon className="h-4 w-4" />
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-foreground/30 animate-pulse-ring" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mt-1 mb-1 w-px h-8 transition-colors duration-300',
                    i < idx ? 'bg-foreground' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <div
                className={cn(
                  'text-sm font-semibold transition-colors duration-300',
                  reached ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
