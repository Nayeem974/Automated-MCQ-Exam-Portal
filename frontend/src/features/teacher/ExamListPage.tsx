import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, ClipboardList, Layers, Plus, Search, Timer, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Button, Card, EmptyState, ErrorState, LinkButton, SkeletonRow } from '../../components/common';
import type { BadgeTone } from '../../components/common';
import { api } from '../../lib/api';

interface Exam {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  durationMinutes: number;
  questionsPerAttempt: number;
  pool: { id: string }[];
  _count: { attempts: number };
}

const statusTone: Record<Exam['status'], BadgeTone> = { DRAFT: 'neutral', PUBLISHED: 'success', CLOSED: 'primary' };

export default function ExamListPage() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
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
      .get<Exam[]>('/exams/mine')
      .then(setExams)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your exams'));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!exams) return [];
    if (!search.trim()) return exams;
    const q = search.trim().toLowerCase();
    return exams.filter((e) => e.title.toLowerCase().includes(q));
  }, [exams, search]);

  async function publish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/exams/${id}/publish`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish');
    } finally {
      setBusyId(null);
    }
  }

  async function close(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/exams/${id}/close`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not close');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(exam: Exam) {
    if (!confirm(`Delete "${exam.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/exams/${exam.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete');
    }
  }

  return (
    <DashboardLayout
      title="Manage Exams"
      description="Publish, close, or review every exam you've created."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams…"
              className="h-10 w-48 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300 sm:w-56"
            />
          </div>
          <LinkButton to="/teacher/exams/new" leftIcon={<Plus className="h-4 w-4" />}>
            New exam
          </LinkButton>
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && exams === null && (
        <Card padded={false}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      )}

      {!error && exams !== null && exams.length === 0 && (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No exams yet"
            description="Create your first exam from one of your courses' question banks."
            action={
              <LinkButton to="/teacher/exams/new" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                New exam
              </LinkButton>
            }
          />
        </Card>
      )}

      {!error && exams !== null && exams.length > 0 && filtered.length === 0 && (
        <Card>
          <EmptyState icon={<Search className="h-6 w-6" />} title="No exams match your search" />
        </Card>
      )}

      {!error && filtered.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-primary-100/60">
            {filtered.map((e) => (
              <li key={e.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">{e.title}</p>
                    <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {e.questionsPerAttempt} / {e.pool.length} pool questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" /> {e.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {e._count.attempts} attempt{e._count.attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    to={`/teacher/exams/${e.id}/analytics`}
                    className="flex items-center gap-1.5 rounded-xl border border-primary-100 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </Link>
                  {e.status === 'DRAFT' && (
                    <Button size="sm" onClick={() => publish(e.id)} loading={busyId === e.id}>
                      Publish
                    </Button>
                  )}
                  {e.status === 'PUBLISHED' && (
                    <Button size="sm" variant="outline" onClick={() => close(e.id)} loading={busyId === e.id}>
                      Close
                    </Button>
                  )}
                  {e._count.attempts === 0 && (
                    <button
                      onClick={() => remove(e)}
                      aria-label={`Delete ${e.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </DashboardLayout>
  );
}
