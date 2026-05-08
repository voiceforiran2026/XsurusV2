'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SignOutButtonProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function SignOutButton({
  variant = 'icon',
  className,
}: SignOutButtonProps) {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const [pending, setPending] = React.useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      await signOut();
      router.push('/giris');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={pending}
        aria-label="Çıkış yap"
        className={cn('rounded-full', className)}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={pending}
      className={cn('justify-start gap-2', className)}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Çıkış yap
    </Button>
  );
}
