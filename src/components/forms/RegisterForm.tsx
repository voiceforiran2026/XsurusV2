'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter'),
  email: z.string().email('Geçerli e-posta giriniz'),
  phone: z.string().min(10, 'Telefon numarası eksik'),
  password: z.string().min(6, 'Parola en az 6 karakter'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Şartları kabul etmelisiniz' }),
  }),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? 'Kayıt başarısız');
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/giris'), 600);
  };

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background"
          >
            <CheckCircle2 className="h-7 w-7" />
          </motion.div>
          <h3 className="text-lg font-semibold">Kayıt başarılı!</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Sunum için lütfen mevcut demo hesaplardan biriyle giriş yapın.
            Yönlendiriliyorsunuz…
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Adınız Soyadınız"
              aria-invalid={!!errors.fullName}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@x.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+90 555 000 00 00"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parola</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="En az 6 karakter"
                aria-invalid={!!errors.password}
                {...register('password')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('acceptTerms')}
              className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
            />
            <span>
              <Link href="#" className="text-foreground hover:underline">
                Kullanım Koşulları
              </Link>
              {' ve '}
              <Link href="#" className="text-foreground hover:underline">
                Gizlilik Politikası
              </Link>
              'nı okudum, kabul ediyorum.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive -mt-3">
              {errors.acceptTerms.message}
            </p>
          )}

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Hesap oluşturuluyor…
              </>
            ) : (
              'Hesap Oluştur'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link
              href="/giris"
              className="font-semibold text-foreground hover:underline"
            >
              Giriş yap
            </Link>
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
