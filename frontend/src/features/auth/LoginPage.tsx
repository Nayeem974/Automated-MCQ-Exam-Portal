import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import { Button, InlineError } from '../../components/common';
import { api, setToken, setCurrentUser } from '../../lib/api';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' };
}

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export default function LoginPage() {
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
      const res = await api.post<LoginResponse>('/auth/login', { email, password });
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
      subtitle="Sign in to pick up right where you left off."
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
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}
