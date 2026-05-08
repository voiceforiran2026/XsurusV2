'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RideRatingDialogProps {
  rideId: string;
  rateeName?: string;
  open: boolean;
  onClose: () => void;
}

export function RideRatingDialog({
  rideId,
  rateeName,
  open,
  onClose,
}: RideRatingDialogProps) {
  const [score, setScore] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setScore(0);
      setHover(0);
      setComment('');
      setSubmitting(false);
      setDone(false);
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (score < 1) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Gönderilemedi');
        return;
      }
      setDone(true);
      setTimeout(() => onClose(), 1100);
    } finally {
      setSubmitting(false);
    }
  };

  const display = hover || score;

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && !v && onClose()}>
      <DialogContent className="max-w-sm">
        {done ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle>Teşekkürler!</DialogTitle>
            <DialogDescription className="mt-1.5">
              Değerlendirmeniz kaydedildi.
            </DialogDescription>
          </motion.div>
        ) : (
          <>
            <DialogTitle>Yolculuğu değerlendir</DialogTitle>
            <DialogDescription>
              {rateeName ? `${rateeName} ile yolculuğunuz nasıldı?` : 'Yolculuğunuz nasıldı?'}
            </DialogDescription>

            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setScore(n)}
                  className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${n} yıldız`}
                >
                  <Star
                    className={cn(
                      'h-9 w-9 transition-colors',
                      n <= display ? 'fill-foreground text-foreground' : 'text-muted-foreground/50',
                    )}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="İsterseniz birkaç kelime ekleyin (opsiyonel)"
              rows={2}
              maxLength={500}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
            />

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                Atla
              </Button>
              <Button className="flex-1" onClick={submit} disabled={submitting || score < 1}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Gönder
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
