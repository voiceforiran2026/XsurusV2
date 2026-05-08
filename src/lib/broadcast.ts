// SSR-güvenli BroadcastChannel sarmalayıcı.
// Aynı tarayıcı oturumundaki sekmeler arası real-time event'ler için.

import type { ServiceType } from '@/types/domain';

export type BroadcastEvent =
  | { type: 'ride:new'; rideId: string; serviceType: ServiceType }
  | { type: 'ride:accepted'; rideId: string; driverId: string }
  | { type: 'ride:started'; rideId: string }
  | { type: 'ride:completed'; rideId: string; chipReward: number }
  | { type: 'ride:cancelled'; rideId: string }
  | { type: 'pool:payout'; totalAmount: number }
  | { type: 'driver:online'; driverId: string; isOnline: boolean }
  // Yeni: canlı sürücü konumu (her ~1sn'de bir, ride scoped)
  | { type: 'ride:driver_position'; rideId: string; lat: number; lng: number; t: number }
  // Yeni: chat
  | { type: 'chat:new_message'; rideId: string; messageId: string; senderId: string; body: string; sentAt: string }
  | { type: 'chat:typing'; rideId: string; senderId: string; isTyping: boolean }
  // Yeni: bildirim (DB'ye yazıldı, diğer sekmeler refresh etsin)
  | { type: 'notification:new'; userId: string; notificationId: string; title: string; body: string; sound?: 'ping' | 'success' | 'cancel' }
  // Tümünü okundu işaretledi (UnreadBadge sıfırlasın)
  | { type: 'notifications:cleared'; userId: string };

const CHANNEL_NAME = 'x-surus';

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function broadcast(event: BroadcastEvent): void {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage(event);
  } catch {
    // sessizce yut
  }
}

export function subscribe(
  handler: (event: BroadcastEvent) => void,
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const listener = (e: MessageEvent<BroadcastEvent>) => {
    if (e.data && typeof e.data === 'object' && 'type' in e.data) {
      handler(e.data);
    }
  };
  ch.addEventListener('message', listener);
  return () => ch.removeEventListener('message', listener);
}

export function isBroadcastSupported(): boolean {
  return (
    typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  );
}
