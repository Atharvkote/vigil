import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      children,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-foreground tracking-wide"
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'w-full h-9 pl-3 pr-8 rounded bg-surface border text-sm text-foreground focus:outline-none focus:ring-1 appearance-none cursor-pointer transition-colors disabled:opacity-50 disabled:bg-surface-secondary',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/30'
                : 'border-border focus:border-primary focus:ring-primary/30',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2.5 text-muted pointer-events-none"
          />
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

Select.displayName = 'Select';
