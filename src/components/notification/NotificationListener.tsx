'use client';

import * as React from 'react';
import { useBroadcastNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Auth'lu layout'lara bir kez mount edilir. BroadcastChannel event'lerine göre
 * ses, vibration, browser notification çalar. Görünüm üretmez.
 */
export function NotificationListener() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  useBroadcastNotifications(userId);
  return null;
}
