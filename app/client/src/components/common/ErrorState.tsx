import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'System Error',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-danger/20 bg-danger-subtle/10 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-danger-subtle border border-danger/30 flex items-center justify-center text-danger mb-3">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-sm font-semibold text-danger tracking-tight">{title}</h3>
      <p className="text-xs text-muted max-w-sm mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw size={14} />}
        >
          Retry Request
        </Button>
      )}
    </div>
  );
}
