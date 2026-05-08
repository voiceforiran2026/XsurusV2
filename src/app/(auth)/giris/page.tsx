import type { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';

export const metadata: Metadata = { title: 'Giriş Yap' };

export default function GirisPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="heading-display text-3xl font-bold">Tekrar hoş geldin</h1>
        <p className="text-sm text-muted-foreground">
          E-posta ve parolanla X hesabına giriş yap.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
