import { ReactNode } from 'react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
  neutral: 'bg-ink-900/5 text-ink-500',
  primary: 'bg-primary-100 text-primary-700',
};

export default function Badge({
  children,
  tone = 'neutral',
  dot,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]} ${className ?? ''}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor(tone)}`} />}
      {children}
    </span>
  );
}

function dotColor(tone: BadgeTone): string {
  switch (tone) {
    case 'success':
      return 'bg-success-500';
    case 'warning':
      return 'bg-warning-500';
    case 'danger':
      return 'bg-danger-500';
    case 'info':
      return 'bg-info-500';
    case 'primary':
      return 'bg-primary-500';
    default:
      return 'bg-ink-400';
  }
}
