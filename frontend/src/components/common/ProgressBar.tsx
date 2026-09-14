import { motion } from 'framer-motion';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<ProgressTone, string> = {
  primary: 'bg-grad-primary',
  success: 'bg-grad-success',
  warning: 'bg-grad-warning',
  danger: 'bg-grad-danger',
  info: 'bg-grad-info',
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
