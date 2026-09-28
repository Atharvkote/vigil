import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded select-none cursor-pointer';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:opacity-90 shadow-sm',
      secondary: 'bg-surface-secondary text-foreground hover:bg-surface-elevated border border-border',
      outline: 'border border-border bg-transparent text-foreground hover:bg-surface-secondary',
      ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface-secondary',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs gap-1.5',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-10 px-5 text-sm gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : 14} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
