import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, ClipboardList, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatCard from '../../components/dashboard/StatCard';
import { Card, EmptyState, ErrorState, SkeletonCard, SkeletonStatGrid } from '../../components/common';
import { api, getCurrentUser } from '../../lib/api';
import { getFirstName, formatRelativeToNow } from '../../lib/format';
import { describeAction } from '../../lib/auditAction';

interface Summary {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalExams: number;
  publishedExams: number;
  totalAttempts: number;
  completedAttempts: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string } | null;
}

export default function AdminDashboard() {
  const user = getCurrentUser();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setSummary(null);
    setActivity(null);
    Promise.all([api.get<Summary>('/analytics/admin/summary'), api.get<AuditLogEntry[]>('/audit-logs?limit=6')])
      .then(([s, a]) => {
        setSummary(s);
        setActivity(a);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the admin dashboard'));
  }

  useEffect(load, []);

  const loading = summary === null || activity === null;
  const quickActions = useMemo(
    () => [
      { to: '/admin/users', icon: Users, title: 'User Management', desc: 'Create, edit, disable, or delete accounts and assign roles.' },
      { to: '/admin/courses', icon: BookOpen, title: 'Course Management', desc: "See every course across all teachers." },
      { to: '/admin/exams', icon: ClipboardList, title: 'Exam Management', desc: 'See every exam and its status platform-wide.' },
      { to: '/admin/audit-logs', icon: ShieldCheck, title: 'Reports & Audit Logs', desc: 'Review recent security-relevant activity in detail.' },
    ],
    [],
  );

  return (
    <DashboardLayout noTitleBar>
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="space-y-6">
          <WelcomeBanner
            name={getFirstName(user?.name)}
            subtitle="Here's what's happening across the platform."
            statusChip={
              !loading && (
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                  {summary!.totalStudents + summary!.totalTeachers + summary!.totalAdmins} total accounts
                </span>
              )
            }
          />

          <div>
            <h2 className="mb-3 font-semibold text-ink-900">Quick Stats</h2>
            {loading ? (
              <SkeletonStatGrid count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={GraduationCap} value={summary!.totalStudents} label="Total Students" tone="primary" index={0} />
                <StatCard icon={Users} value={summary!.totalTeachers} label="Total Teachers" tone="info" index={1} />
                <StatCard
                  icon={ClipboardList}
                  value={summary!.totalExams}
                  label="Total Exams"
                  sub={`${summary!.publishedExams} published`}
                  tone="warning"
                  index={2}
                />
                <StatCard icon={BookOpen} value={summary!.totalCourses} label="Total Courses" tone="success" index={3} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((a) => (
              <QuickAction key={a.to} to={a.to} icon={a.icon} title={a.title} desc={a.desc} />
            ))}
          </div>

          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-primary-100/60 px-5 py-4">
              <div>
                <h2 className="font-semibold text-ink-900">System Activity</h2>
                <p className="mt-0.5 text-sm text-ink-400">The most recent actions recorded platform-wide.</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} lines={1} />
                ))}
              </div>
            ) : activity!.length === 0 ? (
              <EmptyState
                icon={<Activity className="h-6 w-6" />}
                title="No activity recorded yet"
                description="Actions like logins, course changes, and exam publishing will show up here."
              />
            ) : (
              <ul className="divide-y divide-primary-100/60">
                {activity!.map((entry) => {
                  const meta = describeAction(entry.action);
                  return (
                    <li key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">
                          {entry.user ? entry.user.name : 'System'}
                          <span className="font-normal text-ink-400"> · {meta.label.toLowerCase()}</span>
                        </span>
                        <span className="block text-xs text-ink-400">
                          {entry.user ? entry.user.role : '—'} · {formatRelativeToNow(entry.createdAt)}
                        </span>
                      </span>
                    </li>
                  );
                })}
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
  icon: typeof Users;
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
