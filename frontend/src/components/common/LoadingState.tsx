import { Loader2 } from 'lucide-react';

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ink-900/[0.07] ${className ?? ''}`} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-primary-100/60 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-primary-100/60 bg-white p-5 shadow-soft">
          <Skeleton className="mb-3 h-9 w-9 rounded-xl" />
          <Skeleton className="mb-2 h-6 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-400">
      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-ink-400">
      <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
