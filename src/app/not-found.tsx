import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <AppShell>
      <div className="container-narrow py-32 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 heading-display text-5xl font-bold">
          Sayfa bulunamadı
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto">
          Aradığınız sayfa kaldırılmış ya da hiç var olmamış olabilir.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Ana sayfaya dön
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
