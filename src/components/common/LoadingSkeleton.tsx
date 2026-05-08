import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border bg-card p-4"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-full min-h-[280px] overflow-hidden rounded-2xl bg-muted">
      <Skeleton className="absolute inset-0 rounded-2xl" />
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
        Harita yükleniyor…
      </div>
    </div>
  );
}
