'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard3D } from './CreditCard3D';
import { isValidExpiry, formatExpiry } from '@/lib/cards';

const schema = z.object({
  cardholderName: z.string().min(2, 'Ad soyad en az 2 karakter'),
  cardNumber: z
    .string()
    .min(13, 'Kart numarası en az 13 hane'),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, 'AA/YY formatında olmalı')
    .refine((v) => {
      const [m, y] = v.split('/').map(Number);
      return isValidExpiry(m, y);
    }, 'Tarih geçersiz veya süresi dolmuş'),
  cvv: z
    .string()
    .min(3, 'CVV en az 3 hane')
    .max(4, 'CVV en fazla 4 hane')
    .regex(/^\d+$/, 'Sadece rakam'),
  setDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddCardForm() {
  const router = useRouter();
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [flipped, setFlipped] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      setDefault: true,
    },
  });

  const cardNumber = watch('cardNumber');
  const cardholderName = watch('cardholderName');
  const expiry = watch('expiry');
  const cvv = watch('cvv');
  const [em, ey] = expiry?.split('/') ?? ['', ''];

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const [mm, yy] = data.expiry.split('/').map(Number);
    const res = await fetch('/api/me/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardholderName: data.cardholderName,
        cardNumber: data.cardNumber.replace(/\D/g, ''),
        expiryMonth: mm,
        expiryYear: yy,
        cvv: data.cvv,
        setDefault: !!data.setDefault,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(body.error ?? 'Kart eklenemedi');
      return;
    }
    setSuccess(true);
    router.refresh();
    setTimeout(() => router.push('/yolcu/cuzdan'), 600);
  };

  return (
    <div className="space-y-5">
      {/* Üst: 3D kart + güvence rozeti */}
      <div className="flex flex-col items-center gap-3 pt-1">
        <CreditCard3D
          cardNumber={cardNumber || ''}
          cardholderName={cardholderName || ''}
          expiryMonth={em || ''}
          expiryYear={ey || ''}
          cvv={cvv || ''}
          flipped={flipped}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <Lock className="h-3 w-3" />
          Demo modu · gerçek tahsilat yapılmaz
        </span>
      </div>

      {/* Alt: form veya başarı kartı */}
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-7 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280 }}
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background"
            >
              <CheckCircle2 className="h-6 w-6" />
            </motion.div>
            <h3 className="text-base font-semibold">Kart kaydedildi</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Cüzdana yönlendiriliyorsunuz…
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="cardholderName" className="text-xs">
                Kart Sahibi
              </Label>
              <Input
                id="cardholderName"
                placeholder="AD SOYAD"
                autoComplete="cc-name"
                {...register('cardholderName')}
                onChange={(e) =>
                  setValue('cardholderName', e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  })
                }
              />
              {errors.cardholderName && (
                <p className="text-xs text-destructive">
                  {errors.cardholderName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cardNumber" className="text-xs">
                Kart Numarası
              </Label>
              <Input
                id="cardNumber"
                inputMode="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                className="font-mono tracking-wider"
                {...register('cardNumber')}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
                  setValue('cardNumber', grouped, { shouldValidate: true });
                }}
              />
              {errors.cardNumber && (
                <p className="text-xs text-destructive">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expiry" className="text-xs">
                  Son Kullanma
                </Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  placeholder="AA/YY"
                  autoComplete="cc-exp"
                  maxLength={5}
                  className="font-mono tabular-nums"
                  {...register('expiry')}
                  onChange={(e) =>
                    setValue('expiry', formatExpiry(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.expiry && (
                  <p className="text-xs text-destructive">
                    {errors.expiry.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvv" className="text-xs">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  placeholder="•••"
                  maxLength={4}
                  autoComplete="cc-csc"
                  className="font-mono tracking-widest"
                  {...register('cvv')}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  onChange={(e) =>
                    setValue('cvv', e.target.value.replace(/\D/g, '').slice(0, 4), {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.cvv && (
                  <p className="text-xs text-destructive">{errors.cvv.message}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('setDefault')}
                className="h-4 w-4 rounded border-border accent-foreground"
              />
              Varsayılan kart olarak ayarla
            </label>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor…
                </>
              ) : (
                'Kartı Kaydet'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
