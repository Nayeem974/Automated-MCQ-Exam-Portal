import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, FileClock, Search, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Card, EmptyState, ErrorState, SkeletonRow, SkeletonStatGrid } from '../../components/common';
import type { BadgeTone } from '../../components/common';
import { api } from '../../lib/api';

type Status = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

interface Exam {
  id: string;
  title: string;
  status: Status;
  durationMinutes: number;
  course: { title: string };
  createdBy: { name: string };
  _count: { attempts: number; pool: number };
}

const statusTone: Record<Status, BadgeTone> = { DRAFT: 'neutral', PUBLISHED: 'success', CLOSED: 'primary' };

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  // Picks up ?q= from the header's global search if it sent us here.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  function load() {
    setError(null);
    api
      .get<Exam[]>('/exams')
      .then(setExams)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load exams'));
  }

  useEffect(load, []);

  // A lightweight "reports" view derived entirely from the already-fetched
  // list — no separate analytics endpoint exists for a platform-wide exam
  // breakdown, so this is computed client-side rather than left out.
  const breakdown = useMemo(() => {
    if (!exams) return null;
    return {
      draft: exams.filter((e) => e.status === 'DRAFT').length,
      published: exams.filter((e) => e.status === 'PUBLISHED').length,
      closed: exams.filter((e) => e.status === 'CLOSED').length,
      totalAttempts: exams.reduce((sum, e) => sum + e._count.attempts, 0),
    };
  }, [exams]);

  const filtered = useMemo(() => {
    if (!exams) return [];
    if (!search.trim()) return exams;
    const q = search.trim().toLowerCase();
    return exams.filter((e) => `${e.title} ${e.course.title} ${e.createdBy.name}`.toLowerCase().includes(q));
  }, [exams, search]);

  return (
    <DashboardLayout
      title="All Exams"
      description="Every exam and its status, platform-wide. Admin views are read-only — edits stay with the owning teacher."
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams…"
            className="h-10 w-56 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300"
          />
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && exams === null && (
        <div className="space-y-6">
          <SkeletonStatGrid count={4} />
          <Card padded={false}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </Card>
        </div>
      )}

      {!error && exams !== null && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatChip icon={FileClock} label="Draft" value={breakdown!.draft} tone="neutral" />
            <StatChip icon={CheckCircle2} label="Published" value={breakdown!.published} tone="success" />
            <StatChip icon={XCircle} label="Closed" value={breakdown!.closed} tone="primary" />
            <StatChip icon={ClipboardList} label="Total attempts" value={breakdown!.totalAttempts} tone="warning" />
          </div>

          {exams.length === 0 ? (
            <Card>
              <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No exams on the platform yet" />
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState icon={<Search className="h-6 w-6" />} title="No exams match your search" />
            </Card>
          ) : (
            <Card padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-ink-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Exam</th>
                      <th className="px-5 py-3 font-medium">Course</th>
                      <th className="px-5 py-3 font-medium">Teacher</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Pool</th>
                      <th className="px-5 py-3 font-medium">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100/60">
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td className="px-5 py-3 font-semibold text-ink-900">{e.title}</td>
                        <td className="px-5 py-3 text-ink-600">{e.course.title}</td>
                        <td className="px-5 py-3 text-ink-600">{e.createdBy.name}</td>
                        <td className="px-5 py-3">
                          <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                        </td>
                        <td className="px-5 py-3 text-ink-600">{e._count.pool}</td>
                        <td className="px-5 py-3 text-ink-600">{e._count.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
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
  icon: typeof ClipboardList;
  label: string;
  value: number;
  tone: 'neutral' | 'success' | 'primary' | 'warning';
}) {
  const toneClasses = {
    neutral: 'bg-ink-900/5 text-ink-600',
    success: 'bg-success-50 text-success-700',
    primary: 'bg-primary-50 text-primary-700',
    warning: 'bg-warning-50 text-warning-700',
  }[tone];
  return (
    <div className={`rounded-2xl p-4 ${toneClasses}`}>
      <Icon className="mb-2 h-4 w-4" />
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
