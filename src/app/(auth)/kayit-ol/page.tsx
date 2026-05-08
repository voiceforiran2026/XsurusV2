import type { Metadata } from 'next';
import { RegisterForm } from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Kayıt Ol' };

export default function KayitOlPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="heading-display text-3xl font-bold">Hesap oluştur</h1>
        <p className="text-sm text-muted-foreground">
          X'in tüm hizmetlerinden yararlanmak için ücretsiz hesabını oluştur.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
