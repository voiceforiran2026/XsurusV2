'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/useAuthStore';
import { dashboardPathForRoleClient } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Geçerli e-posta giriniz'),
  password: z.string().min(1, 'Parola gerekli'),
});

type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@x.com', password: 'admin123' },
  { role: 'Yolcu', email: 'yolcu@x.com', password: 'yolcu123' },
  { role: 'Sürücü', email: 'surucu@x.com', password: 'surucu123' },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? 'Giriş başarısız');
      return;
    }
    const { user } = await res.json();
    setUser(user);

    const next = params.get('next');
    const target = dashboardPathForRoleClient(user.role);
    if (
      next &&
      (next.startsWith('/yolcu') ||
        next.startsWith('/surucu') ||
        next.startsWith('/admin'))
    ) {
      // Sadece kullanıcı rolüne uyan path'e devam et
      const matchesRole =
        (next.startsWith('/yolcu') && user.role === 'RIDER') ||
        (next.startsWith('/surucu') && user.role === 'DRIVER') ||
        (next.startsWith('/admin') && user.role === 'ADMIN');
      router.push(matchesRole ? next : target);
    } else {
      router.push(target);
    }
    router.refresh();
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <Label htmlFor="password">Parola</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register('password')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
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
              Giriş yapılıyor…
            </>
          ) : (
            'Giriş Yap'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground">
            Demo Hesapları
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.email}
            type="button"
            onClick={() => fillDemo(acc.email, acc.password)}
            className={cn(
              'group flex flex-col items-start gap-1 rounded-xl border bg-card p-3 text-left transition-all duration-150 ease-smooth hover:border-foreground hover:shadow-soft',
            )}
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
              <Sparkles className="h-3 w-3" />
              {acc.role}
            </span>
            <span className="text-xs font-medium truncate w-full">
              {acc.email}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Hesabın yok mu?{' '}
        <Link
          href="/kayit-ol"
          className="font-semibold text-foreground hover:underline"
        >
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
