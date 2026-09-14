import { useEffect, useState } from 'react';
import { BookOpen, ListChecks, ShieldCheck, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, EmptyState, ErrorState, SkeletonRow } from '../../components/common';
import { api } from '../../lib/api';
import { subjectIcon, subjectPastel } from '../../lib/subjectTheme';

interface Course {
  id: string;
  title: string;
  description: string | null;
  teacher: { name: string; email: string };
  _count: { questions: number; exams: number; enrollments: number };
}

const pastelIconClass: Record<ReturnType<typeof subjectPastel>, string> = {
  lavender: 'bg-primary-100 text-primary-600',
  blue: 'bg-info-100 text-info-600',
  green: 'bg-success-100 text-success-700',
  amber: 'bg-warning-100 text-warning-700',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    api
      .get<Course[]>('/courses')
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load courses'));
  }

  useEffect(load, []);

  return (
    <DashboardLayout
      title="All Courses"
      description="Every course across all teachers on the platform. Admin views are read-only — edits stay with the owning teacher."
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && courses === null && (
        <Card padded={false}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      )}

      {!error && courses !== null && courses.length === 0 && (
        <Card>
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No courses on the platform yet" />
        </Card>
      )}

      {!error && courses !== null && courses.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-primary-100/60">
            {courses.map((c) => {
              const Icon = subjectIcon(c.title);
              const pastel = subjectPastel(c.id);
              return (
                <li key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pastelIconClass[pastel]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-900">{c.title}</p>
                      <p className="truncate text-xs text-ink-400">Taught by {c.teacher.name}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-primary-400" /> {c._count.questions} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary-400" /> {c._count.exams} exams
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary-400" /> {c._count.enrollments} enrolled
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DashboardLayout>
  );
}
