import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import HeroIllustration from '../dashboard/HeroIllustration';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand panel — hidden on small screens, matches the sidebar's gradient language */}
      <div className="relative hidden w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-sidebar-gradient p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
        />
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <ClipboardCheck className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-extrabold leading-tight tracking-tight">MCQ Exam Portal</p>
            <p className="text-[11px] font-medium text-white/60">Test Today. Build Tomorrow.</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Exams, grading, and{'\u00A0'}insight —{'\u00A0'}all in one place.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/75">
            A single portal for students, teachers, and admins to run timed MCQ exams and see results the moment
            they're in.
          </p>
        </div>

        <div className="relative z-10 flex justify-center">
          <HeroIllustration className="h-[220px] w-[320px]" />
        </div>

        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/5" />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Compact brand mark for small screens where the side panel is hidden */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <ClipboardCheck className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <p className="font-extrabold tracking-tight text-ink-900">MCQ Exam Portal</p>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>

          <div className="mt-7 rounded-3xl border border-primary-100/60 bg-white p-6 shadow-card sm:p-7">{children}</div>

          <div className="mt-5 text-center text-sm text-ink-400">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
