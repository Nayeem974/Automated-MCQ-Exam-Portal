import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, ClipboardList, Clock3, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatCard from '../../components/dashboard/StatCard';
import CourseCard from '../../components/dashboard/CourseCard';
import UpcomingExams, { UpcomingExamItem } from '../../components/dashboard/UpcomingExams';
import RecentResults, { RecentResultItem } from '../../components/dashboard/RecentResults';
import DailyNotice from '../../components/dashboard/DailyNotice';
import { Badge, Card, EmptyState, ErrorState, SkeletonCard, SkeletonStatGrid } from '../../components/common';
import { api, getCurrentUser } from '../../lib/api';
import { getFirstName } from '../../lib/format';
import { subjectIcon, subjectPastel } from '../../lib/subjectTheme';

interface Course {
  id: string;
  title: string;
  description: string | null;
}

interface Exam {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  questionsPerAttempt: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
}

interface ResultRow {
  id: string;
  percentage: number;
  createdAt: string;
  // `attempt` is included without a `select`, so every Attempt scalar
  // (including examId) comes through alongside the restricted `exam` object.
  attempt: { examId: string; exam: { title: string } };
}

export default function StudentDashboard() {
  const user = getCurrentUser();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setCourses(null);
    setExams(null);
    setResults(null);
    Promise.all([
      api.get<Course[]>('/courses/enrolled'),
      api.get<Exam[]>('/exams/available'),
      api.get<ResultRow[]>('/results'),
    ])
      .then(([c, e, r]) => {
        setCourses(c);
        setExams(e);
        setResults(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your dashboard'));
  }

  useEffect(load, []);

  const loading = courses === null || exams === null || results === null;

  // "Total exams" has no single backend field for a student — it's derived
  // from real numbers (available + already completed) rather than invented.
  const stats = useMemo(() => {
    const completed = results?.length ?? 0;
    const upcoming = exams?.length ?? 0;
    const total = completed + upcoming;
    const avg = results && results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
    return { total, completed, upcoming, avg };
  }, [exams, results]);

  // Exact match against attempt.examId (confirmed present on the /results
  // response — only the nested `exam` relation is field-restricted, not
  // `attempt` itself), rather than matching on exam title.
  const completedExamIds = useMemo(() => new Set((results ?? []).map((r) => r.attempt.examId)), [results]);

  const courseCards = useMemo(() => {
    if (!courses || !exams) return [];
    return courses.slice(0, 4).map((course) => {
      const courseExams = exams.filter((e) => e.courseId === course.id);
      const doneCount = courseExams.filter((e) => completedExamIds.has(e.id)).length;
      const progress = courseExams.length > 0 ? (doneCount / courseExams.length) * 100 : 0;
      const meta =
        courseExams.length === 0
          ? 'No exams open'
          : courseExams.length === 1
            ? `${courseExams[0].questionsPerAttempt} Questions`
            : `${courseExams.length} exams open`;
      const nextExam = courseExams[0];
      return {
        course,
        icon: subjectIcon(course.title),
        pastel: subjectPastel(course.id),
        meta,
        progress,
        ctaTo: nextExam ? `/student/exam-instructions/${nextExam.id}` : undefined,
      };
    });
  }, [courses, exams, completedExamIds]);

  const upcomingItems: UpcomingExamItem[] = useMemo(() => {
    if (!exams || !courses) return [];
    const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
    return [...exams]
      .sort((a, b) => {
        if (a.scheduledStart && b.scheduledStart) return a.scheduledStart.localeCompare(b.scheduledStart);
        if (a.scheduledStart) return -1;
        if (b.scheduledStart) return 1;
        return 0;
      })
      .map((e) => ({
        id: e.id,
        title: e.title,
        courseTitle: courseTitleById.get(e.courseId),
        when: e.scheduledStart,
        to: `/student/exam-instructions/${e.id}`,
      }));
  }, [exams, courses]);

  const recentResultItems: RecentResultItem[] = useMemo(() => {
    if (!results) return [];
    return [...results]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        id: r.id,
        examTitle: r.attempt.exam.title,
        percentage: r.percentage,
        date: r.createdAt,
        to: `/student/results/${r.id}`,
      }));
  }, [results]);

  const nextExamTo = upcomingItems[0]?.to ?? '/student/exams';

  return (
    <DashboardLayout noTitleBar>
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="space-y-6">
          <WelcomeBanner
            name={getFirstName(user?.name)}
            ctaLabel="Start New Exam"
            ctaTo={nextExamTo}
            statusChip={
              !loading && (
                <Badge tone={stats.upcoming > 0 ? 'success' : 'neutral'} dot>
                  {stats.upcoming > 0 ? `${stats.upcoming} exam${stats.upcoming !== 1 ? 's' : ''} open` : 'All caught up'}
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
                <StatCard icon={ClipboardList} value={stats.total} label="Total Exams" tone="primary" index={0} />
                <StatCard icon={CheckCircle2} value={stats.completed} label="Completed" tone="success" index={1} />
                <StatCard icon={Clock3} value={stats.upcoming} label="Upcoming" tone="warning" index={2} />
                <StatCard
                  icon={BarChart3}
                  value={`${Math.round(stats.avg)}%`}
                  label="Average Score"
                  tone="danger"
                  index={3}
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-900">My Courses</h2>
              <Link to="/student/exams" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                See all
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : courseCards.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<GraduationCap className="h-6 w-6" />}
                  title="You're not enrolled in any courses yet"
                  description="Once you're enrolled in a course, it will show up here alongside its exams."
                />
              </Card>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
                {courseCards.map(({ course, icon, pastel, meta, progress, ctaTo }, i) => (
                  <CourseCard
                    key={course.id}
                    icon={icon}
                    title={course.title}
                    meta={meta}
                    progress={progress}
                    ctaTo={ctaTo}
                    pastel={pastel}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">{loading ? <SkeletonCard lines={4} /> : <DailyNotice />}</div>
            <div className="space-y-6">
              {loading ? <SkeletonCard lines={4} /> : <UpcomingExams items={upcomingItems} seeAllTo="/student/exams" />}
              {loading ? (
                <SkeletonCard lines={4} />
              ) : (
                <RecentResults items={recentResultItems} seeAllTo="/student/results" />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
