import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, LogOut, X } from 'lucide-react';
import { getNavForRole } from './navConfig';
import type { CurrentUser } from '../../lib/api';

interface SidebarProps {
  role: CurrentUser['role'] | undefined;
  mobileOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

function SidebarContent({ role, onSignOut, onNavigate }: { role: CurrentUser['role'] | undefined; onSignOut: () => void; onNavigate?: () => void }) {
  const items = getNavForRole(role);
  return (
    <div className="flex h-full flex-col bg-sidebar-gradient text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pb-6 pt-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <ClipboardCheck className="h-6 w-6 text-white" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold leading-tight tracking-tight">MCQ Exam Portal</p>
          <p className="truncate text-[11px] font-medium text-white/60">Test Today. Build Tomorrow.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white font-semibold text-primary-700 shadow-card'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-4 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-white"
                  />
                )}
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600' : 'text-white/70 group-hover:text-white'}`}
                  strokeWidth={2}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ role, mobileOpen, onClose, onSignOut }: SidebarProps) {
  return (
    <>
      {/* Desktop: fixed sidebar with rounded right edge */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] overflow-hidden rounded-r-3xl shadow-card lg:block">
        <SidebarContent role={role} onSignOut={onSignOut} />
      </aside>

      {/* Mobile: off-canvas drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] overflow-hidden rounded-r-3xl shadow-card lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent role={role} onSignOut={onSignOut} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
