import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded bg-surface-secondary/80 border border-border-subtle/50',
        className
      )}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 pt-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
