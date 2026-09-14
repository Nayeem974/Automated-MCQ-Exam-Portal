import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api, getCurrentUser, getToken, setCurrentUser, clearToken, clearCurrentUser, CurrentUser } from '../lib/api';
import { FullScreenLoader } from '../components/common';

interface Props {
  allow: CurrentUser['role'][];
}

// Verifies the stored token against /auth/me on every protected navigation
// rather than trusting localStorage blindly — catches expired tokens and
// accounts an admin has disabled since the token was issued.
export default function ProtectedRoute({ allow }: Props) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'invalid'>('checking');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('invalid');
      return;
    }
    api
      .get<CurrentUser>('/auth/me')
      .then((user) => {
        setCurrentUser(user);
        setStatus('ok');
      })
      .catch(() => {
        clearToken();
        clearCurrentUser();
        setStatus('invalid');
      });
  }, []);

  if (status === 'checking') {
    return <FullScreenLoader label="Loading…" />;
  }

  if (status === 'invalid') return <Navigate to="/login" replace />;

  const user = getCurrentUser();
  if (!user || !allow.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
