import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, Timer } from 'lucide-react';
import { Button, FullScreenLoader, InlineError } from '../../components/common';
import { api } from '../../lib/api';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  marks: number;
  options: Option[];
  selectedOptionId: string | null;
}

interface AttemptView {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
  remainingSeconds: number;
  questions: Question[];
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// This screen intentionally renders outside DashboardLayout — no sidebar,
// no nav-away affordances — so a student can't accidentally leave an
// in-progress, server-timed exam.
export default function ExamTakingPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [view, setView] = useState<AttemptView | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false); // guards against double auto-submit

  const loadAttempt = useCallback(async () => {
    if (!attemptId) return;
    try {
      const data = await api.get<AttemptView>(`/attempts/${attemptId}`);
      if (data.status !== 'IN_PROGRESS') {
        navigate('/student/results');
        return;
      }
      setView(data);
      setRemaining(data.remainingSeconds);
      const initialAnswers: Record<string, string | null> = {};
      data.questions.forEach((q) => (initialAnswers[q.id] = q.selectedOptionId));
      setAnswers(initialAnswers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load exam attempt');
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const result = await api.post<{ id: string }>(`/attempts/${attemptId}/submit`);
      navigate(`/student/results/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    if (!view) return;
    if (remaining <= 0) {
      doSubmit();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining, view, doSubmit]);

  async function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (!attemptId) return;
    try {
      await api.post(`/attempts/${attemptId}/answer`, { questionId, selectedOptionId: optionId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your answer — check your connection');
    }
  }

  if (error && !view) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-sm rounded-2xl border border-danger-100 bg-white p-6 text-center shadow-card">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-danger-500" />
          <p className="text-sm text-danger-700">{error}</p>
          <button onClick={() => navigate('/student')} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!view) return <FullScreenLoader label="Loading exam…" />;

  const question = view.questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const lowTime = remaining <= 60;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-primary-100/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{view.examTitle}</p>
            <p className="text-xs text-ink-400">
              Question {currentIndex + 1} of {view.questions.length} · {answeredCount} answered
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-sm font-bold ${
              lowTime ? 'animate-pulse bg-danger-50 text-danger-600' : 'bg-primary-50 text-primary-700'
            }`}
          >
            <Timer className="h-4 w-4" />
            {formatCountdown(remaining)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {error && <InlineError message={error} />}

        {/* Question navigator */}
        <div className="mb-5 flex flex-wrap gap-2">
          {view.questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 ${
                  isCurrent
                    ? 'bg-primary-600 text-white shadow-glow'
                    : isAnswered
                      ? 'bg-success-50 text-success-700 hover:bg-success-100'
                      : 'bg-white text-ink-400 ring-1 ring-primary-100 hover:bg-primary-50'
                }`}
                aria-current={isCurrent}
                aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ', not answered'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Current question */}
        <div className="rounded-3xl border border-primary-100/60 bg-white p-6 shadow-card sm:p-7">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary-500">
            Question {currentIndex + 1} · {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </p>
          <p className="mb-6 text-lg font-semibold leading-snug text-ink-900">{question.text}</p>

          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-sm font-medium transition-all duration-150 ${
                    selected
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-primary-100 text-ink-700 hover:border-primary-200 hover:bg-primary-50/40'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => selectAnswer(question.id, opt.id)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-primary-600 bg-primary-600' : 'border-primary-200'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  {opt.text}
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.min(view.questions.length - 1, i + 1))}
              disabled={currentIndex === view.questions.length - 1}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
          <Button onClick={() => setConfirmingSubmit(true)} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Submit exam
          </Button>
        </div>
      </main>

      {confirmingSubmit && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink-900">Submit exam?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              You've answered {answeredCount} of {view.questions.length} questions.
              {answeredCount < view.questions.length && ' Unanswered questions will score zero.'} This cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmingSubmit(false)}>
                Keep working
              </Button>
              <Button onClick={doSubmit} loading={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
