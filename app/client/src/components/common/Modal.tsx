import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box */}
      <div
        className={clsx(
          'relative w-full rounded-lg bg-surface border border-border shadow-xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-muted mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded hover:bg-surface-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3 border-t border-border bg-surface-secondary/40 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
