import Link from 'next/link';
import { XLogo } from '@/components/icons/XLogo';
import { RoleBadge } from '@/components/layout/RoleBadge';
import { SignOutButton } from '@/components/layout/SignOutButton';
import type { SessionUser } from '@/types/domain';
import { cn } from '@/lib/utils';

interface AccountTopBarProps {
  user: SessionUser;
  variant?: 'light' | 'dark';
  homeHref?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function AccountTopBar({
  user,
  variant = 'light',
  homeHref = '/',
  rightSlot,
  className,
}: AccountTopBarProps) {
  const isDark = variant === 'dark';
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-md',
        isDark
          ? 'bg-canvas/85 border-white/10 text-white'
          : 'bg-background/85 border-border text-foreground',
        className,
      )}
    >
      <div className="container-wide flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="flex items-center gap-2">
            <XLogo size="sm" variant={isDark ? 'inverted' : 'mono'} />
            <span className="hidden sm:inline font-semibold">X</span>
          </Link>
          <RoleBadge role={user.role} />
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span
                className={cn(
                  'text-xs font-medium',
                  isDark ? 'text-white' : 'text-foreground',
                )}
              >
                {user.fullName}
              </span>
              <span
                className={cn(
                  'text-[10px]',
                  isDark ? 'text-white/50' : 'text-muted-foreground',
                )}
              >
                {user.email}
              </span>
            </div>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                isDark
                  ? 'bg-white text-black'
                  : 'bg-foreground text-background',
              )}
              aria-hidden
            >
              {user.fullName
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <SignOutButton
              variant="icon"
              className={cn(
                isDark
                  ? 'text-white hover:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
