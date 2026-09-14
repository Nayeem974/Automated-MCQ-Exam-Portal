import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ClipboardList, Clock3, ListChecks, Repeat, ShieldCheck, Target } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, Card, ErrorState, InlineError, PageLoader } from '../../components/common';
import { api } from '../../lib/api';

interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questionsPerAttempt: number;
  passingMark: number;
  maxAttempts: number | null;
  course: { title: string };
}

export default function ExamInstructionsPage() {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  function load() {
    if (!examId) return;
    setLoadError(null);
    setExam(null);
    api
      .get<ExamDetail>(`/exams/${examId}`)
      .then(setExam)
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Could not load this exam'));
  }

  useEffect(load, [examId]);

  async function handleStart() {
    if (!examId) return;
    setStarting(true);
    setStartError(null);
    try {
      const attempt = await api.post<{ id: string }>(`/attempts/start/${examId}`);
      navigate(`/student/exam/${attempt.id}`);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Could not start exam');
      setStarting(false);
    }
  }

  return (
    <DashboardLayout title="Exam Instructions" description="Review the rules before you begin.">
      {loadError && <ErrorState message={loadError} onRetry={load} />}
      {!loadError && !exam && <PageLoader label="Loading exam details…" />}

      {!loadError && exam && (
        <div className="mx-auto max-w-2xl">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">{exam.course.title}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink-900">{exam.title}</h2>
            {exam.description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{exam.description}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={Clock3} label="Duration" value={`${exam.durationMinutes} min`} />
              <Stat icon={ListChecks} label="Questions" value={String(exam.questionsPerAttempt)} />
              <Stat icon={Target} label="Passing mark" value={`${exam.passingMark}%`} />
              <Stat icon={Repeat} label="Attempts" value={exam.maxAttempts ? String(exam.maxAttempts) : 'Unlimited'} />
            </div>

            <div className="mt-6 rounded-2xl bg-primary-50/60 p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                <ShieldCheck className="h-4 w-4 text-primary-600" /> Before you start
              </p>
              <ul className="space-y-2 text-sm text-ink-600">
                <Rule text="Questions and answer options are randomized for every attempt." />
                <Rule text="Your answers are saved automatically as you go." />
                <Rule text="The timer is enforced by the server — closing or refreshing the tab will not stop it." />
                <Rule text="When time runs out, your exam is submitted automatically with whatever you've answered." />
                <Rule text="Once submitted, answers cannot be changed." />
              </ul>
            </div>

            {startError && <InlineError message={startError} />}

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleStart} loading={starting} size="lg" leftIcon={<ClipboardList className="h-4 w-4" />}>
                {starting ? 'Starting…' : 'Start exam'}
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <AlertCircle className="h-3.5 w-3.5" /> The timer starts the moment you click Start.
              </p>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary-50/60 px-3 py-3 text-center">
      <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary-500" />
      <p className="text-sm font-extrabold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
      {text}
    </li>
  );
}
