import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Card, EmptyState, ErrorState, SkeletonRow } from '../../components/common';
import { api } from '../../lib/api';
import { formatDate, scoreTone } from '../../lib/format';

interface ResultRow {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  createdAt: string;
  attempt: { exam: { title: string } };
}

export default function StudentResultHistoryPage() {
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setResults(null);
    api
      .get<ResultRow[]>('/results')
      .then(setResults)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your results'));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!results) return [];
    if (!search.trim()) return results;
    const q = search.trim().toLowerCase();
    return results.filter((r) => r.attempt.exam.title.toLowerCase().includes(q));
  }, [results, search]);

  return (
    <DashboardLayout
      title="Result History"
      description="Every exam you've completed, most recent first."
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search results…"
            className="h-10 w-56 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300"
          />
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && results === null && (
        <Card padded={false}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      )}

      {!error && results !== null && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<Award className="h-6 w-6" />}
            title={results.length === 0 ? 'No results yet' : 'No results match your search'}
            description={
              results.length === 0
                ? 'Complete an exam and your score will appear here.'
                : 'Try a different exam name.'
            }
          />
        </Card>
      )}

      {!error && results !== null && filtered.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-primary-100/60">
            {filtered.map((r) => {
              const tone = scoreTone(r.percentage);
              return (
                <li key={r.id}>
                  <Link
                    to={`/student/results/${r.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-primary-50/50"
                  >
                    <span
                      className={`flex h-11 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                        { success: 'bg-success-50 text-success-700', warning: 'bg-warning-50 text-warning-700', danger: 'bg-danger-50 text-danger-700' }[tone]
                      }`}
                    >
                      {r.percentage.toFixed(0)}%
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900">{r.attempt.exam.title}</p>
                      <p className="text-xs text-ink-400">
                        {r.score}/{r.maxScore} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <Badge tone={r.passed ? 'success' : 'danger'}>{r.passed ? 'Passed' : 'Failed'}</Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DashboardLayout>
  );
}
