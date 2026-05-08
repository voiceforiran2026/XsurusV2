'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Package, MapPin, Plus, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

export function ServiceSelectorCard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = React.useState<'RIDE' | 'GO'>('RIDE');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && user.role === 'RIDER') {
      router.push('/yolcu');
    } else if (user) {
      router.push('/giris?next=/yolcu');
    } else {
      router.push('/giris?next=/yolcu');
    }
  };

  return (
    <div className="rounded-2xl bg-background p-2 shadow-soft-lg ring-1 ring-foreground/5 animate-fade-in">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'RIDE' | 'GO')}>
        <TabsList className="w-full">
          <TabsTrigger value="RIDE">
            <Car className="h-4 w-4" />
            Ride
          </TabsTrigger>
          <TabsTrigger value="GO">
            <Package className="h-4 w-4" />
            Go
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="px-4 pb-4 pt-2 mt-0 space-y-3">
          <form onSubmit={submit} className="space-y-3">
            <FieldRow
              icon={<MapPin className="h-4 w-4 text-foreground" />}
              placeholder="Nereden?"
              value={from}
              onChange={setFrom}
              trailing={
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Konum
                </span>
              }
            />
            <FieldRow
              icon={<MapPin className="h-4 w-4 text-foreground" />}
              placeholder="Nereye?"
              value={to}
              onChange={setTo}
              trailing={
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Durak ekle"
                >
                  <Plus className="h-4 w-4" />
                </button>
              }
            />
            <Button type="submit" size="lg" className="w-full">
              Hizmet Bul
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground">
            {tab === 'RIDE'
              ? 'Konforlu yolculuk için sürücü çağırın'
              : 'Paketinizi güvenle gönderin'}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FieldRowProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}

function FieldRow({
  icon,
  placeholder,
  value,
  onChange,
  trailing,
}: FieldRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-background px-3.5 py-1 transition-colors duration-150',
        'focus-within:border-foreground',
      )}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
      />
      {trailing}
    </div>
  );
}
