import type { Role } from '@/types/domain';

export function dashboardPathForRoleClient(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DRIVER':
      return '/surucu';
    case 'RIDER':
    default:
      return '/yolcu';
  }
}

export const ROLE_LABELS_TR: Record<Role, string> = {
  ADMIN: 'Süper Admin',
  DRIVER: 'Sürücü',
  RIDER: 'Yolcu',
};

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-foreground text-background',
  DRIVER: 'bg-foreground/10 text-foreground',
  RIDER: 'bg-foreground/5 text-foreground border border-border',
};
