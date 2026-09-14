import { PenLine } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FeaturePending } from '../../components/common';

// There's no concept of an untimed/unscored "practice" attempt in the
// data model — every Exam is a graded, timed, attempt-limited record.
// Rather than quietly pointing "Practice Test" at a real graded exam
// (which could confuse a student about whether it counts), this stays a
// clear placeholder until the backend distinguishes practice attempts.
export default function PracticeTestPage() {
  return (
    <DashboardLayout title="Practice Test" description="Low-stakes practice runs before the real thing.">
      <FeaturePending
        icon={<PenLine className="h-7 w-7" />}
        title="Practice mode is coming soon"
        description="Every exam in this portal today is graded, timed, and attempt-limited — there's no separate practice mode yet. Adding one means being able to mark certain attempts as practice so they never affect your real results or rank."
        unlocksWhen="Needs an isPractice flag (or similar) on Exam/Attempt, plus an endpoint to start a practice run."
      />
    </DashboardLayout>
  );
}
