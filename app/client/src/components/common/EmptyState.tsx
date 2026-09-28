import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface-secondary/20 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-muted mb-3">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-muted max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
