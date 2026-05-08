'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/yolcu', label: 'Ana Sayfa', icon: Home, exact: true },
  { href: '/yolcu/cuzdan', label: 'Cüzdan', icon: Wallet },
  { href: '/yolcu/yolculuklarim', label: 'Yolculuklar', icon: History },
  { href: '/yolcu/profil', label: 'Profil', icon: User },
];

export function RiderBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="max-w-md mx-auto flex justify-around">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2.5 text-[10px] font-medium transition-colors duration-150',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon
                className={cn('h-4 w-4', active && 'fill-current')}
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
