import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { rolePrefix } from './navConfig';
import { clearToken, clearCurrentUser, getCurrentUser } from '../../lib/api';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchPlaceholder?: string;
  /** Set true for pages (like the student dashboard) that render their own hero/banner in place of a title bar. */
  noTitleBar?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  description,
  actions,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  noTitleBar,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  function signOut() {
    clearToken();
    clearCurrentUser();
    navigate('/login');
  }

  // Every role has its own "/exams" list (My Exams / Manage Exams / All
  // Exams). Absent a page-specific handler, Enter in the global search
  // jumps there with the query carried in `?q=` so that page's own filter
  // (where one exists) can pick it up, rather than the search doing nothing.
  function defaultSearchSubmit(value: string) {
    const trimmed = value.trim();
    navigate(`${rolePrefix(user?.role)}/exams${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar role={user?.role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onSignOut={signOut} />

      <div className="lg:pl-[260px]">
        <Header
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          onSignOut={signOut}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit ?? defaultSearchSubmit}
          searchPlaceholder={searchPlaceholder}
        />

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"
        >
          {!noTitleBar && title && (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
                {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
