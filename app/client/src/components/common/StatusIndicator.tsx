import clsx from 'clsx';

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'maintenance' | 'active' | 'inactive';
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusIndicator({ status, label, size = 'sm' }: StatusIndicatorProps) {
  const configs = {
    online: {
      color: 'bg-success',
      shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      text: 'text-success',
      defaultLabel: 'ONLINE',
    },
    active: {
      color: 'bg-success',
      shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      text: 'text-success',
      defaultLabel: 'ACTIVE',
    },
    warning: {
      color: 'bg-warning',
      shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      text: 'text-warning',
      defaultLabel: 'ATTENTION',
    },
    maintenance: {
      color: 'bg-warning',
      shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      text: 'text-warning',
      defaultLabel: 'MAINTENANCE',
    },
    offline: {
      color: 'bg-danger',
      shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      text: 'text-danger',
      defaultLabel: 'OFFLINE',
    },
    inactive: {
      color: 'bg-muted',
      shadow: 'none',
      text: 'text-muted',
      defaultLabel: 'INACTIVE',
    },
  };

  const config = configs[status];
  const dotSizes = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="inline-flex items-center gap-1.5 select-none font-mono">
      <span className={clsx('rounded-full shrink-0 animate-pulse', dotSizes, config.color, config.shadow)} />
      {(label || config.defaultLabel) && (
        <span className={clsx('text-[11px] font-semibold tracking-wider uppercase', config.text)}>
          {label || config.defaultLabel}
        </span>
      )}
    </div>
  );
}
