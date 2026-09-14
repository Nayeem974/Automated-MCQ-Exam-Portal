import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<StatTone, { bg: string; icon: string; blob: string; ring: string }> = {
  primary: { bg: 'bg-gradient-to-br from-primary-50 to-white', icon: 'bg-grad-primary text-white shadow-glow', blob: 'bg-primary-400', ring: 'hover:ring-primary-200' },
  success: { bg: 'bg-gradient-to-br from-success-50 to-white', icon: 'bg-grad-success text-white', blob: 'bg-success-500', ring: 'hover:ring-success-200' },
  warning: { bg: 'bg-gradient-to-br from-warning-50 to-white', icon: 'bg-grad-warning text-white', blob: 'bg-warning-500', ring: 'hover:ring-warning-200' },
  danger: { bg: 'bg-gradient-to-br from-danger-50 to-white', icon: 'bg-grad-danger text-white', blob: 'bg-danger-500', ring: 'hover:ring-danger-200' },
  info: { bg: 'bg-gradient-to-br from-info-50 to-white', icon: 'bg-grad-info text-white', blob: 'bg-info-500', ring: 'hover:ring-info-200' },
};

export default function StatCard({
  icon: Icon,
  value,
  label,
  tone = 'primary',
  trend,
  index = 0,
  sub,
}: {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  tone?: StatTone;
  trend?: { value: number; positive?: boolean };
  index?: number;
  sub?: string;
}) {
  const t = toneClasses[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border border-white p-5 shadow-soft ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${t.bg} ${t.ring}`}
    >
      <div
        className={`absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-40 ${t.icon.split(' ')[0]}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${trend.positive === false ? 'text-danger-600' : 'text-success-600'}`}
          >
            {trend.positive === false ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="relative mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{value}</p>
      <p className="relative text-sm font-medium text-ink-500">{label}</p>
      {sub && <p className="relative mt-0.5 text-xs text-ink-400">{sub}</p>}
    </motion.div>
  );
}
