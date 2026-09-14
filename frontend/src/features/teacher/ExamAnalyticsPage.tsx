import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, ListChecks, Percent, Target, TrendingDown, Trophy, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Card, CardHeader, EmptyState, ErrorState, ProgressBar, SkeletonCard, SkeletonStatGrid } from '../../components/common';
import { api } from '../../lib/api';
import type { ProgressTone } from '../../components/common';

interface Summary {
  attempts: number;
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

interface QuestionStat {
  questionId: string;
  text: string;
  timesAnswered: number;
  percentCorrect: number;
}

interface LeaderboardRow {
  id: string;
  score: number;
  percentage: number;
  rank: number | null;
  passed: boolean;
  attempt: { student: { name: string; email: string } };
}

function toneFor(pct: number): ProgressTone {
  if (pct >= 70) return 'success';
  if (pct >= 40) return 'warning';
  return 'danger';
}

export default function ExamAnalyticsPage() {
  const { examId } = useParams<{ examId: string }>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStat[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!examId) return;
    setError(null);
    setSummary(null);
    setQuestionStats(null);
    setLeaderboard(null);
    Promise.all([
      api.get<Summary>(`/analytics/exams/${examId}/summary`),
      api.get<QuestionStat[]>(`/analytics/exams/${examId}/questions`),
      api.get<LeaderboardRow[]>(`/results/exam?examId=${examId}`),
    ])
      .then(([s, q, l]) => {
        setSummary(s);
        setQuestionStats(q);
        setLeaderboard(l);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load analytics'));
  }

  useEffect(load, [examId]);

  const loading = summary === null || questionStats === null || leaderboard === null;

  return (
    <DashboardLayout title="Exam Analytics" description="Class performance, question breakdown, and leaderboard.">
      <Link
        to="/teacher/exams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to exams
      </Link>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && (
        <div className="space-y-6">
          <SkeletonStatGrid count={5} />
          <SkeletonCard lines={4} />
        </div>
      )}

      {!error && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatChip icon={Users} label="Attempts" value={String(summary!.attempts)} tone="primary" />
            <StatChip icon={Target} label="Class average" value={summary!.classAverage.toFixed(1)} tone="info" />
            <StatChip icon={Trophy} label="Highest" value={String(summary!.highestScore)} tone="success" />
            <StatChip icon={TrendingDown} label="Lowest" value={String(summary!.lowestScore)} tone="danger" />
            <StatChip icon={Percent} label="Pass rate" value={`${summary!.passRate.toFixed(0)}%`} tone="warning" />
          </div>

          <Card>
            <CardHeader
              title="Question-wise performance"
              subtitle="How the class did on each question in this exam."
              action={
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <ListChecks className="h-4 w-4" />
                </div>
              }
            />
            {questionStats!.length === 0 ? (
              <EmptyState compact title="No attempts yet" description="Question stats appear once students start submitting." />
            ) : (
              <div className="space-y-4">
                {questionStats!.map((q, i) => (
                  <div key={q.questionId}>
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                      <span className="truncate text-ink-700">
                        {i + 1}. {q.text}
                      </span>
                      <span className="shrink-0 font-semibold text-ink-900">{q.percentCorrect.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={q.percentCorrect} tone={toneFor(q.percentCorrect)} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padded={false}>
            <div className="flex items-center gap-2 border-b border-primary-100/60 px-5 py-4">
              <Award className="h-4 w-4 text-primary-500" />
              <h2 className="font-semibold text-ink-900">Leaderboard</h2>
            </div>
            {leaderboard!.length === 0 ? (
              <EmptyState compact title="No attempts yet" description="The leaderboard fills in as students complete this exam." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-ink-400">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Rank</th>
                      <th className="px-5 py-2.5 font-medium">Student</th>
                      <th className="px-5 py-2.5 font-medium">Score</th>
                      <th className="px-5 py-2.5 font-medium">Percentage</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100/60">
                    {leaderboard!.map((r) => (
                      <tr key={r.id}>
                        <td className="px-5 py-3 font-semibold text-ink-900">{r.rank ? `#${r.rank}` : '—'}</td>
                        <td className="px-5 py-3 text-ink-700">{r.attempt.student.name}</td>
                        <td className="px-5 py-3 text-ink-700">{r.score}</td>
                        <td className="px-5 py-3 text-ink-700">{r.percentage.toFixed(1)}%</td>
                        <td className="px-5 py-3">
                          <Badge tone={r.passed ? 'success' : 'danger'}>{r.passed ? 'Passed' : 'Failed'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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
  icon: typeof Users;
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const toneClasses = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
    info: 'bg-info-50 text-info-700',
  }[tone];
  return (
    <div className={`rounded-2xl p-4 ${toneClasses}`}>
      <Icon className="mb-2 h-4 w-4" />
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
