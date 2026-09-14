import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, ClipboardList, FilePlus2, ListChecks, Trophy, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatCard from '../../components/dashboard/StatCard';
import { Badge, Card, EmptyState, ErrorState, SkeletonCard, SkeletonStatGrid } from '../../components/common';
import { api, getCurrentUser } from '../../lib/api';
import { getFirstName } from '../../lib/format';

interface Course {
  id: string;
  title: string;
  _count: { questions: number; exams: number; enrollments: number };
}

interface Exam {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  durationMinutes: number;
  _count: { attempts: number };
}

interface LeaderboardRow {
  percentage: number;
}

const statusStyle: Record<Exam['status'], 'neutral' | 'success' | 'primary'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  CLOSED: 'primary',
};

export default function TeacherDashboard() {
  const user = getCurrentUser();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [avgPerformance, setAvgPerformance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setCourses(null);
    setExams(null);
    setAvgPerformance(null);
    Promise.all([api.get<Course[]>('/courses/mine'), api.get<Exam[]>('/exams/mine')])
      .then(async ([c, e]) => {
        setCourses(c);
        setExams(e);

        // No single "average performance" endpoint for a teacher — derive
        // it from every result across every one of their exams that has
        // at least one attempt (weighted by attempt count, not
        // average-of-averages, so a 200-student exam isn't drowned out
        // by a 2-student one).
        const examsWithAttempts = e.filter((x) => x._count.attempts > 0);
        if (examsWithAttempts.length === 0) {
          setAvgPerformance(null);
          return;
        }
        const rows = await Promise.all(
          examsWithAttempts.map((x) => api.get<LeaderboardRow[]>(`/results/exam?examId=${x.id}`).catch(() => [])),
        );
        const all = rows.flat();
        setAvgPerformance(all.length > 0 ? all.reduce((sum, r) => sum + r.percentage, 0) / all.length : null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your dashboard'));
  }

  useEffect(load, []);

  const loading = courses === null || exams === null;

  const stats = useMemo(() => {
    const totalExams = exams?.length ?? 0;
    const totalQuestions = (courses ?? []).reduce((sum, c) => sum + c._count.questions, 0);
    // Sum of per-course enrollments — a proxy for "students taught", not a
    // deduplicated headcount (a student in two of your courses counts
    // twice). A true unique count needs a dedicated backend query.
    const totalStudents = (courses ?? []).reduce((sum, c) => sum + c._count.enrollments, 0);
    return { totalExams, totalQuestions, totalStudents };
  }, [courses, exams]);

  const recentExams = useMemo(() => [...(exams ?? [])].slice(0, 5), [exams]);

  return (
    <DashboardLayout noTitleBar>
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="space-y-6">
          <WelcomeBanner
            name={getFirstName(user?.name)}
            subtitle="Manage your courses and keep track of student progress."
            ctaLabel="Create Exam"
            ctaTo="/teacher/exams/new"
            statusChip={
              !loading && (
                <Badge tone="primary" dot>
                  {stats.totalExams} exam{stats.totalExams !== 1 ? 's' : ''} total
                </Badge>
              )
            }
          />

          <div>
            <h2 className="mb-3 font-semibold text-ink-900">Quick Stats</h2>
            {loading ? (
              <SkeletonStatGrid count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={ClipboardList} value={stats.totalExams} label="Total Exams" tone="primary" index={0} />
                <StatCard
                  icon={ListChecks}
                  value={stats.totalQuestions}
                  label="Total Questions"
                  tone="info"
                  index={1}
                />
                <StatCard icon={Users} value={stats.totalStudents} label="Students" tone="warning" index={2} />
                <StatCard
                  icon={BarChart3}
                  value={avgPerformance === null ? '—' : `${Math.round(avgPerformance)}%`}
                  label="Average Performance"
                  tone="success"
                  index={3}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction to="/teacher/exams" icon={ClipboardList} title="Manage Exams" desc="Publish, close, or review every exam you've created." />
            <QuickAction to="/teacher/courses" icon={BookOpen} title="Question Bank" desc="Pick a course to add, edit, or remove questions." />
            <QuickAction to="/teacher/exams" icon={Trophy} title="Student Results" desc="Open an exam's analytics for scores and leaderboards." />
            <QuickAction to="/teacher/exams/new" icon={FilePlus2} title="Create Exam" desc="Build a new timed exam from your question pool." />
          </div>

          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-primary-100/60 px-5 py-4">
              <h2 className="font-semibold text-ink-900">Recent Exams</h2>
              <Link to="/teacher/exams" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                See all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} lines={1} />
                ))}
              </div>
            ) : recentExams.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="No exams yet"
                description="Create your first exam to see it listed here."
              />
            ) : (
              <ul className="divide-y divide-primary-100/60">
                {recentExams.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-900">{e.title}</p>
                      <p className="text-xs text-ink-400">
                        {e.durationMinutes} min · {e._count.attempts} attempt{e._count.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={statusStyle[e.status]}>{e.status}</Badge>
                      <Link
                        to={`/teacher/exams/${e.id}/analytics`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Analytics
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof ClipboardList;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to}>
      <Card hoverable className="h-full">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-3 font-bold text-ink-900">{title}</p>
        <p className="mt-1 text-sm text-ink-400">{desc}</p>
      </Card>
    </Link>
  );
}
