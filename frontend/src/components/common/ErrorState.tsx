import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  message,
  onRetry,
  compact,
}: {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-danger-100 bg-danger-50/60 text-center ${compact ? 'p-4' : 'p-8'}`}
    >
      <AlertTriangle className="mb-2 h-6 w-6 text-danger-500" />
      <p className="text-sm font-medium text-danger-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry} leftIcon={<RotateCw className="h-3.5 w-3.5" />}>
          Try again
        </Button>
      )}
    </div>
  );
}

// Inline, single-line variant for forms/toasts where a full card is too heavy.
export function InlineError({ message }: { message: string }) {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-700">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
