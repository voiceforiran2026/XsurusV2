import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/db';
import { getSession } from './session';
import type { Role, SessionUser } from '@/types/domain';

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
    avatarUrl: user.avatarUrl,
  };
});

export function dashboardPathForRole(role: Role): string {
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
