import * as React from 'react';
import Link from 'next/link';
import { XLogo } from '@/components/icons/XLogo';
import { RoleBadge } from '@/components/layout/RoleBadge';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { UnreadBadge } from '@/components/notification/UnreadBadge';
import type { SessionUser } from '@/types/domain';
import { cn } from '@/lib/utils';

interface MobileTopBarProps {
  user: SessionUser;
  unreadCount: number;
  bildirimlerHref: string;
  homeHref: string;
  className?: string;
}

/**
 * Yolcu/sürücü mobil çerçevesi içinde sticky-top yerleşen ince başlık.
 * 400px'lik frame genişliğine sığacak şekilde tasarlanmıştır:
 * Logo · RoleBadge | Bell badge · İlk-harf avatar · Çıkış
 */
export function MobileTopBar({
  user,
  unreadCount,
  bildirimlerHref,
  homeHref,
  className,
}: MobileTopBarProps) {
  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-2 px-4 py-2.5',
        className,
      )}
    >
      <Link
        href={homeHref}
        className="flex items-center gap-2 min-w-0"
        aria-label="Ana sayfa"
      >
        <XLogo size="sm" variant="mono" />
        <RoleBadge role={user.role} />
      </Link>

      <div className="flex items-center gap-1.5">
        <UnreadBadge initialUnread={unreadCount} href={bildirimlerHref} />
        <div
          className="hidden xs:flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-[11px] font-bold"
          aria-hidden
          title={user.fullName}
        >
          {initials}
        </div>
        <SignOutButton variant="icon" />
      </div>
    </header>
  );
}
