import { ROLE_BADGE_COLORS, ROLE_LABELS_TR } from '@/lib/auth/roles';
import type { Role } from '@/types/domain';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        ROLE_BADGE_COLORS[role],
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          role === 'ADMIN' ? 'bg-background' : 'bg-foreground',
        )}
      />
      {ROLE_LABELS_TR[role]}
    </span>
  );
}
