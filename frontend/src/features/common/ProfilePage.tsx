import { BadgeCheck, Mail, ShieldCheck, UserCog } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar, Badge, Card, LinkButton } from '../../components/common';
import { getCurrentUser } from '../../lib/api';
import { roleLabel } from '../../components/layout/navConfig';

// Read-only by design: `/auth/me` is the only self-service endpoint any
// role has today (see redesign report — a PATCH "update my profile"
// endpoint doesn't exist for STUDENT/TEACHER, and ADMIN's is really
// "edit any user by id" under /admin/users). Rather than fake a working
// edit form, this page shows real account data and points admins to the
// screen where editing genuinely works.
export default function ProfilePage() {
  const user = getCurrentUser();

  return (
    <DashboardLayout title="Profile" description="Your account details on the MCQ Exam Portal.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={user?.name} email={user?.email} size="xl" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-extrabold text-ink-900">{user?.name ?? 'Unknown user'}</h2>
              <p className="truncate text-sm text-ink-400">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{user ? roleLabel[user.role] : '—'}</Badge>
                {user?.isActive !== false && (
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-primary-100/60 pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={user?.email ?? '—'} />
            <InfoRow icon={ShieldCheck} label="Role" value={user ? roleLabel[user.role] : '—'} />
          </div>
        </Card>

        <Card className="h-fit">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Editing your profile</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                {user?.role === 'ADMIN'
                  ? 'As an admin you can update your own name, email, or password from User Management.'
                  : "Self-service profile editing isn't available yet — ask an administrator to update your details."}
              </p>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <LinkButton to="/admin/users" variant="outline" size="sm" className="mt-4 w-full">
              Go to User Management
            </LinkButton>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary-50/50 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-primary-500" />
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-800">{value}</p>
      </div>
      <BadgeCheck className="ml-auto h-4 w-4 shrink-0 text-success-500" />
    </div>
  );
}
