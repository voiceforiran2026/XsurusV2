'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useChatChannel, emitChatMessage, emitTyping } from '@/hooks/useChatChannel';
import { useFrameContainer } from '@/components/layout/MobileFrameContext';

interface ChatMessage {
  id: string;
  senderId: string;
  body: string;
  sentAt: string;
}

interface RideChatDrawerProps {
  rideId: string;
  currentUserId: string;
  otherUserName?: string;
  open: boolean;
  onClose: () => void;
}

const QUICK_PRESETS = [
  'Yoldayım',
  'Geldim',
  'Buradayım',
  'Teşekkürler',
];

export function RideChatDrawer({
  rideId,
  currentUserId,
  otherUserName,
  open,
  onClose,
}: RideChatDrawerProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [otherTyping, setOtherTyping] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // İlk açılışta mesajları yükle
  React.useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/rides/${rideId}/messages`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.messages ?? []);
          setLoaded(true);
        }
      } catch {
        // sessizce yut
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, loaded, rideId]);

  // BroadcastChannel: yeni mesaj veya yazıyor sinyali
  useChatChannel(open ? rideId : null, {
    onMessage: (msg) => {
      // Kendi gönderdiğimiz tekrar dönmesin
      if (msg.senderId === currentUserId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.messageId)) return prev;
        return [...prev, { id: msg.messageId, senderId: msg.senderId, body: msg.body, sentAt: msg.sentAt }];
      });
    },
    onTyping: (info) => {
      if (info.senderId === currentUserId) return;
      setOtherTyping(info.isTyping);
      if (info.isTyping) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setOtherTyping(false), 2500);
      }
    },
  });

  // Yeni mesaj geldiğinde scroll en alta
  React.useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [messages.length, otherTyping, open]);

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');
    emitTyping(rideId, currentUserId, false);
    try {
      const res = await fetch(`/api/rides/${rideId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const msg = data.message as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      // Karşı tarafta useBroadcastNotifications zaten chat:new_message dinleyip ses çalar.
      // Burada ek bir notification:new yaymak çift bildirim ve `userId:'self'` ile yanlış
      // kullanıcıya yönlenir → kaldırıldı.
      emitChatMessage(rideId, {
        messageId: msg.id,
        senderId: msg.senderId,
        body: msg.body,
        sentAt: msg.sentAt,
      });
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (v: string) => {
    setInput(v);
    if (v.length > 0) {
      emitTyping(rideId, currentUserId, true);
    }
  };

  // Frame container'a portal et — yolcu/sürücü ekranında çerçevenin DIŞINA
  // taşmasın diye. Frame yoksa (örn. admin) document.body'e portal'lanır.
  const frameContainer = useFrameContainer();

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={cn(
              'absolute z-50 bg-background border-t shadow-soft-lg flex flex-col',
              'inset-x-0 bottom-0 rounded-t-3xl h-[85%]',
            )}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Mesajlaşma</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {otherUserName ?? 'Karşı taraf'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {!loaded && (
                <div className="flex justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {loaded && messages.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-6">
                  Henüz mesaj yok. İlk siz selam verin.
                </div>
              )}
              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex',
                      mine ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm',
                        mine
                          ? 'bg-foreground text-background rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md',
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
              {otherTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-2xl px-3.5 py-2 text-xs italic">
                    yazıyor…
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    disabled={sending}
                    className="rounded-full bg-muted hover:bg-muted/70 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={500}
                  placeholder="Mesaj yazın…"
                  className="flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors max-h-32"
                />
                <Button type="submit" size="icon" disabled={sending || !input.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // SSR sırasında portal yapma; client mount sonrası container var olur
  if (typeof window === 'undefined') return null;
  // Mobile frame içindeysek frame'e portal et, değilse body'e
  return createPortal(drawer, frameContainer ?? document.body);
}
