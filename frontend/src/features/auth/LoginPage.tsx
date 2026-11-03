import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, GraduationCap, Presentation, ShieldCheck } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import { Button, InlineError } from '../../components/common';
import { api, setToken, setCurrentUser } from '../../lib/api';

type LoginRole = 'ADMIN' | 'STUDENT' | 'TEACHER';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' };
}

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

const ROLE_OPTIONS: Array<{
  value: LoginRole;
  label: string;
  description: string;
  Icon: typeof GraduationCap;
}> = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Manage users, courses, exams, and audit logs.',
    Icon: ShieldCheck,
  },
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'Take exams, practice, and view results.',
    Icon: GraduationCap,
  },
  {
    value: 'TEACHER',
    label: 'Teacher',
    description: 'Create exams, manage questions, and view analytics.',
    Icon: Presentation,
  },
];

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password, role });
      setToken(res.accessToken);
      setCurrentUser(res.user);
      navigate(ROLE_HOME[res.user.role] ?? '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Choose your role and sign in to continue."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <InlineError message={error} />}

        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-ink-700">I am a</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(({ value, label, description, Icon }) => {
              const selected = role === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={selected}
                  className={selected
                    ? 'rounded-2xl border border-primary-400 bg-primary-50 p-3 text-left ring-2 ring-primary-200 transition-all'
                    : 'rounded-2xl border border-primary-100 bg-white p-3 text-left transition-all hover:border-primary-200 hover:bg-primary-50/40'}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={selected
                        ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white'
                        : 'flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600'}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-ink-900">{label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-400">{description}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mb-4 block text-sm font-medium text-ink-700">
          Email
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-primary-100 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-300"
            />
          </div>
        </label>

        <label className="mb-6 block text-sm font-medium text-ink-700">
          Password
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-primary-100 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-300"
            />
          </div>
        </label>

        <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<LogIn className="h-4 w-4" />}>
          {loading ? 'Signing in…' : `Sign in as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
        </Button>
      </form>
    </AuthShell>
  );
}
