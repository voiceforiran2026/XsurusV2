'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { broadcast, subscribe } from '@/lib/broadcast';

export type NotificationSound = 'ping' | 'success' | 'cancel';

const SOUND_FILES: Record<NotificationSound, string> = {
  ping: '/sounds/ping.wav',
  success: '/sounds/success.wav',
  cancel: '/sounds/cancel.wav',
};

// Audio cache — her ses için tek Audio instance (multi-play race'i engellemek için clone kullanılır)
const audioCache: Partial<Record<NotificationSound, HTMLAudioElement>> = {};

function getAudio(sound: NotificationSound): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audioCache[sound]) {
    try {
      const a = new Audio(SOUND_FILES[sound]);
      a.preload = 'auto';
      a.volume = 0.7;
      audioCache[sound] = a;
    } catch {
      return null;
    }
  }
  return audioCache[sound] ?? null;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  sound?: NotificationSound;
  vibrate?: number | number[];
  icon?: string;
  /** True ise tarayıcı bildirimi de gönderilir (izin varsa). */
  browser?: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window === 'undefined' || typeof Notification === 'undefined'
      ? 'unsupported'
      : Notification.permission,
  );

  const requestPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof Notification === 'undefined') return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return permission;
    }
  }, [permission]);

  const playSound = useCallback((sound: NotificationSound) => {
    const a = getAudio(sound);
    if (!a) return;
    try {
      // Clone for overlapping plays
      const clone = a.cloneNode(true) as HTMLAudioElement;
      clone.volume = a.volume;
      clone.play().catch(() => {
        // Otomatik oynatma engellenirse sessizce yut (ilk user interaction'a kadar policy)
      });
    } catch {
      // sessizce yut
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // sessizce yut
      }
    }
  }, []);

  const notify = useCallback(
    (opts: NotificationOptions) => {
      if (opts.sound) playSound(opts.sound);
      if (opts.vibrate) vibrate(opts.vibrate);
      if (opts.browser !== false && permission === 'granted') {
        try {
          new Notification(opts.title, {
            body: opts.body,
            icon: opts.icon ?? '/icon.png',
            badge: '/icon.png',
            silent: true, // ses zaten kendi audio'yla geldi
          });
        } catch {
          // sessizce yut
        }
      }
    },
    [permission, playSound, vibrate],
  );

  return { permission, requestPermission, notify, playSound, vibrate };
}

/**
 * Globale broadcast dinleyici hook — ride event'leri geldikçe sesli/bildirim üretir.
 * (rider) ve (driver) layout'larında bir kez mount edilir.
 */
export function useBroadcastNotifications(currentUserId: string | null) {
  const { notify } = useNotifications();
  const lastFireRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribe((e) => {
      const now = Date.now();
      // Aynı event 1sn içinde iki kez tetiklenmesin (echo guard)
      const key = `${e.type}:${'rideId' in e ? e.rideId : ''}`;
      if (lastFireRef.current[key] && now - lastFireRef.current[key] < 1000) return;
      lastFireRef.current[key] = now;

      switch (e.type) {
        case 'ride:new':
          notify({ title: 'Yeni Talep', body: 'Yakındaki bir yolcu sürücü arıyor', sound: 'ping', vibrate: [120, 60, 120] });
          break;
        case 'ride:accepted':
          notify({ title: 'Sürücü Onayladı', body: 'Sürücünüz size doğru geliyor', sound: 'success', vibrate: 80 });
          break;
        case 'ride:completed':
          notify({ title: 'Yolculuk Tamamlandı', body: `+${e.chipReward.toFixed(2)} chip kazandınız`, sound: 'success', vibrate: [80, 40, 80] });
          break;
        case 'ride:cancelled':
          notify({ title: 'Yolculuk İptal', body: 'Yolculuk iptal edildi', sound: 'cancel' });
          break;
        case 'chat:new_message':
          if (e.senderId !== currentUserId) {
            notify({ title: 'Yeni Mesaj', body: e.body.slice(0, 80), sound: 'ping' });
          }
          break;
        case 'notification:new':
          if (e.userId === currentUserId) {
            notify({ title: e.title, body: e.body, sound: e.sound ?? 'ping' });
          }
          break;
      }
    });
    return unsub;
  }, [currentUserId, notify]);
}

export function broadcastNotification(args: {
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  sound?: NotificationSound;
}) {
  broadcast({
    type: 'notification:new',
    userId: args.userId,
    notificationId: args.notificationId,
    title: args.title,
    body: args.body,
    sound: args.sound,
  });
}
