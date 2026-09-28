import React from 'react';
import clsx from 'clsx';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral' 
  | 'primary'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    success: {
      bg: 'bg-success-subtle text-success border-success/30',
      dotColor: 'bg-success',
    },
    warning: {
      bg: 'bg-warning-subtle text-warning border-warning/30',
      dotColor: 'bg-warning',
    },
    danger: {
      bg: 'bg-danger-subtle text-danger border-danger/30',
      dotColor: 'bg-danger',
    },
    info: {
      bg: 'bg-info-subtle text-info border-info/30',
      dotColor: 'bg-info',
    },
    primary: {
      bg: 'bg-primary-subtle text-primary border-primary/30',
      dotColor: 'bg-primary',
    },
    neutral: {
      bg: 'bg-surface-secondary text-muted border-border',
      dotColor: 'bg-muted',
    },
    outline: {
      bg: 'bg-transparent text-foreground border-border',
      dotColor: 'bg-foreground',
    },
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const config = variants[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border tracking-wide uppercase font-mono select-none',
        config.bg,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />}
      {children}
    </span>
  );
}
