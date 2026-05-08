'use client';

import { useEffect, useRef } from 'react';
import { broadcast, subscribe, type BroadcastEvent } from '@/lib/broadcast';

export interface ChatChannelHandlers {
  onMessage?: (msg: { messageId: string; senderId: string; body: string; sentAt: string }) => void;
  onTyping?: (info: { senderId: string; isTyping: boolean }) => void;
}

/**
 * Ride scoped chat kanalı: BroadcastChannel + DB persist için ortak yardımcı.
 * Sadece bu rideId'ye ait mesajları dinler.
 */
export function useChatChannel(rideId: string | null, handlers: ChatChannelHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!rideId) return;
    const unsub = subscribe((e: BroadcastEvent) => {
      if (e.type === 'chat:new_message' && e.rideId === rideId) {
        handlersRef.current.onMessage?.({
          messageId: e.messageId,
          senderId: e.senderId,
          body: e.body,
          sentAt: e.sentAt,
        });
      } else if (e.type === 'chat:typing' && e.rideId === rideId) {
        handlersRef.current.onTyping?.({ senderId: e.senderId, isTyping: e.isTyping });
      }
    });
    return unsub;
  }, [rideId]);
}

export function emitChatMessage(rideId: string, msg: { messageId: string; senderId: string; body: string; sentAt: string }) {
  broadcast({
    type: 'chat:new_message',
    rideId,
    messageId: msg.messageId,
    senderId: msg.senderId,
    body: msg.body,
    sentAt: msg.sentAt,
  });
}

export function emitTyping(rideId: string, senderId: string, isTyping: boolean) {
  broadcast({ type: 'chat:typing', rideId, senderId, isTyping });
}
