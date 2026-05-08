'use client';

import * as React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SessionUser } from '@/types/domain';

export function AuthHydrator({ user }: { user: SessionUser | null }) {
  const setUser = useAuthStore((s) => s.setUser);
  React.useEffect(() => {
    setUser(user);
  }, [user, setUser]);
  return null;
}
