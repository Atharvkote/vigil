import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'interactive';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-surface border-border',
    secondary: 'bg-surface-secondary border-border-subtle',
    interactive: 'bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer',
  };

  return (
    <div
      className={clsx(
        'rounded-lg border p-5 shadow-xs transition-shadow',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  subtitle,
  action,
  children,
}: {
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        {title && (
          <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {children}
    </div>
  );
}
