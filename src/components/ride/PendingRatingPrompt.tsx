'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RideRatingDialog } from '@/components/ride/RideRatingDialog';

interface PendingRatingPromptProps {
  rideId: string;
  driverName: string | null;
}

/**
 * Yolcu ana sayfasında: son tamamlanmış ama puanlanmamış yolculuk için
 * otomatik 1.5sn sonra rating dialog'u açar. Atla'lırsa sayfada bir
 * "Yolculuğunu Değerlendir" kartı görünür kalır — yolcu sonra puanlayabilir.
 */
export function PendingRatingPrompt({ rideId, driverName }: PendingRatingPromptProps) {
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  // Auto-open after 1.5s. React StrictMode'da double-mount durumunda
  // cleanup timeout'u cancel eder, ikinci mount yeni timeout scheduler.
  // Ref guard YOK — yoksa StrictMode'da hiç açılmaz.
  React.useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [rideId, dismissed]);

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
  };

  return (
    <>
      {dismissed && (
        <Card className="p-4 bg-canvas text-white border-canvas">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-canvas shrink-0">
              <Star className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Son yolculuğunuzu değerlendirin</p>
              {driverName && (
                <p className="text-xs text-white/70 truncate">{driverName}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 shrink-0"
              onClick={() => setOpen(true)}
            >
              Puanla
            </Button>
          </div>
        </Card>
      )}

      <RideRatingDialog
        rideId={rideId}
        rateeName={driverName ?? undefined}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}
