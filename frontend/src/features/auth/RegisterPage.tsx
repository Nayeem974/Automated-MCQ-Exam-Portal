import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import { Button, InlineError } from '../../components/common';
import { api, setToken, setCurrentUser } from '../../lib/api';

interface RegisterResponse {
  accessToken: string;
  user: { id: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' };
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Public self-registration always creates a STUDENT account — Admin and
  // Teacher accounts are provisioned by an admin (see /admin/users).
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<RegisterResponse>('/auth/register', { name, email, password });
      setToken(res.accessToken);
      setCurrentUser(res.user);
      navigate('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Teacher and admin accounts are set up by an administrator."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <InlineError message={error} />}

        <label className="mb-4 block text-sm font-medium text-ink-700">
          Name
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-primary-100 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-300"
            />
          </div>
        </label>

        <label className="mb-4 block text-sm font-medium text-ink-700">
          Email
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="email"
              required
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-primary-100 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-300"
            />
          </div>
        </label>

        <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<GraduationCap className="h-4 w-4" />}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
