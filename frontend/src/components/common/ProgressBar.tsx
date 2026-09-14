import { motion } from 'framer-motion';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<ProgressTone, string> = {
  primary: 'bg-primary-600',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

export default function ProgressBar({
  value,
  tone = 'primary',
  trackClassName,
  height = 8,
}: {
  value: number;
  tone?: ProgressTone;
  trackClassName?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-ink-900/[0.06] ${trackClassName ?? ''}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full rounded-full ${toneClasses[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}
