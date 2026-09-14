import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import Card from './Card';

// A polished "this needs a backend endpoint" state — used anywhere the
// design brief calls for a screen that the current API doesn't support
// yet (announcements, student-facing question bank/practice mode,
// notifications). Keeps those sections from either being left broken or
// silently filled with fabricated data.
export default function FeaturePending({
  icon,
  title,
  description,
  unlocksWhen,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  /** Plain-language description of the backend capability that would light this up. */
  unlocksWhen?: string;
}) {
  return (
    <Card className="mx-auto max-w-xl text-center" padded={false}>
      <div className="flex flex-col items-center px-6 py-14 sm:px-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
          {icon ?? <Sparkles className="h-7 w-7" />}
        </div>
        <h2 className="mt-5 text-lg font-bold text-ink-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">{description}</p>
        {unlocksWhen && (
          <p className="mt-5 rounded-xl bg-primary-50/70 px-4 py-3 text-xs font-medium leading-relaxed text-primary-700">
            {unlocksWhen}
          </p>
        )}
      </div>
    </Card>
  );
}
