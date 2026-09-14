import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import LinkButton from '../common/LinkButton';
import ProgressBar from '../common/ProgressBar';

export type CoursePastel = 'lavender' | 'blue' | 'green' | 'amber';

const pastelClasses: Record<CoursePastel, { bg: string; icon: string; bar: 'primary' | 'info' | 'success' | 'warning' }> = {
  lavender: { bg: 'bg-primary-50', icon: 'bg-primary-100 text-primary-600', bar: 'primary' },
  blue: { bg: 'bg-info-50', icon: 'bg-info-100 text-info-600', bar: 'info' },
  green: { bg: 'bg-success-50', icon: 'bg-success-100 text-success-700', bar: 'success' },
  amber: { bg: 'bg-warning-50', icon: 'bg-warning-100 text-warning-700', bar: 'warning' },
};

export default function CourseCard({
  icon: Icon,
  title,
  meta,
  progress,
  ctaTo,
  ctaLabel = 'Take Exam',
  pastel = 'lavender',
  index = 0,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  progress: number;
  ctaTo?: string;
  ctaLabel?: string;
  pastel?: CoursePastel;
  index?: number;
  disabled?: boolean;
}) {
  const c = pastelClasses[pastel];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className={`flex w-[240px] shrink-0 flex-col rounded-2xl border border-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:w-auto ${c.bg}`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.icon}`}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] font-bold leading-snug text-ink-900">{title}</p>
      <p className="mb-3 text-xs font-medium text-ink-400">{meta}</p>

      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-ink-500">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <ProgressBar value={progress} tone={c.bar} />

      <div className="mt-4">
        {ctaTo && !disabled ? (
          <LinkButton to={ctaTo} size="sm" fullWidth>
            {ctaLabel}
          </LinkButton>
        ) : (
          <button
            disabled
            className="h-8 w-full cursor-not-allowed rounded-xl bg-ink-900/5 text-xs font-semibold text-ink-400"
          >
            No exam available
          </button>
        )}
      </div>
    </motion.div>
  );
}
