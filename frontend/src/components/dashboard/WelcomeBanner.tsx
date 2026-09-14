import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import LinkButton from '../common/LinkButton';
import HeroIllustration from './HeroIllustration';
import { formatDate } from '../../lib/format';

export default function WelcomeBanner({
  name,
  subtitle = 'Keep learning. Keep growing.',
  ctaLabel,
  ctaTo,
  statusChip,
}: {
  name: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaTo?: string;
  statusChip?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative isolate overflow-hidden rounded-3xl bg-purple-gradient px-6 py-7 text-white shadow-glow-lg sm:px-9 sm:py-9"
    >
      {/* subtle grid texture for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]"
      />
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(new Date())}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Welcome back, {name}!
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">{subtitle}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {ctaTo && ctaLabel && (
              <LinkButton
                to={ctaTo}
                variant="secondary"
                className="!bg-white !text-primary-700 hover:!bg-white/90"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {ctaLabel}
              </LinkButton>
            )}
            {statusChip}
          </div>
        </div>

        <div className="hidden shrink-0 sm:block">
          <HeroIllustration className="h-[190px] w-[280px]" />
        </div>
      </div>

      {/* decorative background circles */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/5" />
    </motion.div>
  );
}
