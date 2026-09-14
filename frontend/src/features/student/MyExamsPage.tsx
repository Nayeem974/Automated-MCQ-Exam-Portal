import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, ClipboardList, ListChecks, Search, Timer } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, EmptyState, ErrorState, LinkButton, SkeletonCard } from '../../components/common';
import { api } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/format';
import { subjectIcon, subjectPastel } from '../../lib/subjectTheme';

interface Course {
  id: string;
  title: string;
}

interface Exam {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questionsPerAttempt: number;
  passingMark: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
}

export default function MyExamsPage() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [error, setError] = useState<string | null>(null);

  // The header's global search lands here via ?q=; keep this page's own
  // search box in sync if the person searches again while already here.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  function load() {
    setError(null);
    setExams(null);
    Promise.all([api.get<Exam[]>('/exams/available'), api.get<Course[]>('/courses/enrolled')])
      .then(([e, c]) => {
        setExams(e);
        setCourses(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your exams'));
  }

  useEffect(load, []);

  const courseTitleById = useMemo(() => new Map(courses.map((c) => [c.id, c.title])), [courses]);

  const filtered = useMemo(() => {
    if (!exams) return [];
    return exams.filter((e) => {
      if (courseFilter && e.courseId !== courseFilter) return false;
      if (!search.trim()) return true;
      const haystack = `${e.title} ${courseTitleById.get(e.courseId) ?? ''}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [exams, courseFilter, search, courseTitleById]);

  return (
    <DashboardLayout
      title="My Exams"
      description="Exams currently open for your enrolled courses."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams…"
              className="h-10 w-48 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300 sm:w-64"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-10 rounded-xl border border-primary-100 bg-white px-3 text-sm outline-none focus:border-primary-300"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && exams === null && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!error && exams !== null && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title={exams.length === 0 ? 'No exams available right now' : 'No exams match your search'}
            description={
              exams.length === 0
                ? 'When a teacher publishes an exam for one of your courses, it will show up here.'
                : 'Try a different search term or clear the course filter.'
            }
          />
        </Card>
      )}

      {!error && exams !== null && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => {
            const courseTitle = courseTitleById.get(exam.courseId) ?? 'General';
            const Icon = subjectIcon(courseTitle);
            const pastel = subjectPastel(exam.courseId);
            return (
              <Card key={exam.id} hoverable className={pastelBg(pastel)}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${pastelIcon(pastel)}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                </div>
                <p className="mt-3 font-bold leading-snug text-ink-900">{exam.title}</p>
                <p className="text-xs font-medium text-ink-400">{courseTitle}</p>

                <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                  <p className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" /> {exam.durationMinutes} min · {exam.questionsPerAttempt} questions
                    · pass {exam.passingMark}%
                  </p>
                  {exam.scheduledEnd && (
                    <p className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" /> Closes {formatDate(exam.scheduledEnd)} ·{' '}
                      {formatTime(exam.scheduledEnd)}
                    </p>
                  )}
                </div>

                <LinkButton to={`/student/exam-instructions/${exam.id}`} size="sm" fullWidth className="mt-4">
                  <ListChecks className="h-4 w-4" />
                  View & start
                </LinkButton>
              </Card>
            );
          })}
        </div>
      )}

      {!error && exams !== null && exams.length > 0 && (
        <p className="mt-4 text-xs text-ink-400">
          Looking for past attempts? Head to{' '}
          <Link to="/student/results" className="font-semibold text-primary-600 hover:text-primary-700">
            Results
          </Link>
          .
        </p>
      )}
    </DashboardLayout>
  );
}

function pastelBg(pastel: ReturnType<typeof subjectPastel>): string {
  return { lavender: 'bg-primary-50', blue: 'bg-info-50', green: 'bg-success-50', amber: 'bg-warning-50' }[pastel];
}
function pastelIcon(pastel: ReturnType<typeof subjectPastel>): string {
  return {
    lavender: 'bg-primary-100 text-primary-600',
    blue: 'bg-info-100 text-info-600',
    green: 'bg-success-100 text-success-700',
    amber: 'bg-warning-100 text-warning-700',
  }[pastel];
}
