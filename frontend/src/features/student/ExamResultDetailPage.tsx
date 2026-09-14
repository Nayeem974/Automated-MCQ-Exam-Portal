import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Clock3, EyeOff, Hash, Trophy, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Card, ErrorState, PageLoader, ScoreRing } from '../../components/common';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

interface ReviewOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface ReviewItem {
  questionId: string;
  text: string;
  options: ReviewOption[];
  selectedOptionId: string | null;
  isCorrect?: boolean | null;
  explanation?: string;
}

interface ResultDetail {
  id: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rank: number | null;
  submittedAt: string;
  revealAnswers: boolean;
  review: ReviewItem[];
}

export default function ExamResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!resultId) return;
    setError(null);
    setResult(null);
    api
      .get<ResultDetail>(`/results/${resultId}`)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load this result'));
  }

  useEffect(load, [resultId]);

  return (
    <DashboardLayout title="Exam Result" description="Your performance breakdown for this attempt.">
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !result && <PageLoader label="Loading result…" />}

      {!error && result && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <ScoreRing percentage={result.percentage} label={result.grade} />
                <div className="text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">{result.examTitle}</p>
                  <p className="mt-1 text-3xl font-extrabold text-ink-900">
                    {result.score}
                    <span className="text-lg font-medium text-ink-400"> / {result.maxScore}</span>
                  </p>
                  <Badge tone={result.passed ? 'success' : 'danger'} className="mt-2">
                    {result.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-primary-100/60 pt-6 sm:grid-cols-4">
              <StatChip icon={CheckCircle2} label="Correct" value={String(result.correctCount)} tone="success" />
              <StatChip icon={XCircle} label="Wrong" value={String(result.wrongCount)} tone="danger" />
              <StatChip icon={Hash} label="Unanswered" value={String(result.unansweredCount)} tone="neutral" />
              {result.rank ? (
                <StatChip icon={Trophy} label="Class rank" value={`#${result.rank}`} tone="primary" />
              ) : (
                <StatChip icon={Clock3} label="Submitted" value={formatDateTime(result.submittedAt)} tone="neutral" />
              )}
            </div>
          </Card>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
              <Award className="h-4 w-4 text-primary-500" /> Question review
            </h2>
            {!result.revealAnswers ? (
              <Card>
                <div className="flex flex-col items-center py-8 text-center">
                  <EyeOff className="mb-2 h-6 w-6 text-ink-300" />
                  <p className="text-sm font-medium text-ink-500">
                    Your teacher hasn't enabled answer review for this exam.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {result.review.map((item, i) => (
                  <Card key={item.questionId}>
                    <p className="mb-3 text-sm font-semibold text-ink-900">
                      {i + 1}. {item.text}
                    </p>
                    <div className="space-y-2">
                      {item.options.map((opt) => {
                        const isSelected = item.selectedOptionId === opt.id;
                        const isCorrectOpt = opt.isCorrect;
                        return (
                          <div
                            key={opt.id}
                            className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                              isCorrectOpt
                                ? 'border-success-500/40 bg-success-50 text-success-700'
                                : isSelected
                                  ? 'border-danger-500/40 bg-danger-50 text-danger-700'
                                  : 'border-primary-100 text-ink-600'
                            }`}
                          >
                            {opt.text}
                            {isSelected && <span className="ml-2 text-xs text-ink-400">(your answer)</span>}
                            {isCorrectOpt && <span className="ml-2 text-xs font-semibold">(correct)</span>}
                          </div>
                        );
                      })}
                    </div>
                    {item.explanation && <p className="mt-3 text-sm text-ink-400">{item.explanation}</p>}
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Link
            to="/student/results"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to result history
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'neutral' | 'primary';
}) {
  const toneClasses = {
    success: 'bg-success-50 text-success-700',
    danger: 'bg-danger-50 text-danger-700',
    neutral: 'bg-ink-900/5 text-ink-600',
    primary: 'bg-primary-50 text-primary-700',
  }[tone];
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${toneClasses}`}>
      <Icon className="mx-auto mb-1 h-4 w-4" />
      <p className="text-sm font-extrabold">{value}</p>
      <p className="text-[11px] opacity-80">{label}</p>
    </div>
  );
}
