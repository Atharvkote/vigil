import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-foreground tracking-wide"
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'w-full h-9 rounded bg-surface border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:bg-surface-secondary',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/30'
                : 'border-border focus:border-primary focus:ring-primary/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted pointer-events-none shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-danger font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
