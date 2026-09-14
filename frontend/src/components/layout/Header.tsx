import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search, User as UserIcon } from 'lucide-react';
import Avatar from '../common/Avatar';
import type { CurrentUser } from '../../lib/api';
import { roleLabel, rolePrefix } from './navConfig';

interface HeaderProps {
  user: CurrentUser | null;
  onMenuClick: () => void;
  onSignOut: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function Header({
  user,
  onMenuClick,
  onSignOut,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search exams, subjects, or anything…',
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prefix = rolePrefix(user?.role);

  // Search is "controlled if the page wants it, uncontrolled otherwise" —
  // most pages don't pass searchValue/onSearchChange at all, and a plain
  // controlled input with no onChange handler would reset every keystroke
  // (the box would look frozen). Keeping local state means typing always
  // works, while a page that does pass onSearchChange still hears about it.
  const [localSearch, setLocalSearch] = useState(searchValue ?? '');
  useEffect(() => {
    if (searchValue !== undefined) setLocalSearch(searchValue);
  }, [searchValue]);

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    onSearchChange?.(value);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-primary-100/60 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-700 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearchSubmit?.(localSearch);
          }}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-primary-100 bg-primary-50/40 pl-10 pr-4 text-sm text-ink-700 placeholder:text-ink-300 outline-none transition-colors focus:border-primary-300 focus:bg-white"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-3">
        <Link
          to={`${prefix}/notifications`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-primary-50 sm:pr-3"
          >
            <Avatar name={user?.name} email={user?.email} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-ink-900">{user?.name ?? user?.email}</span>
              <span className="block text-xs leading-tight text-ink-400">{user ? roleLabel[user.role] : ''}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-primary-100 bg-white p-1.5 shadow-card"
              >
                <div className="px-3 py-2 sm:hidden">
                  <p className="truncate text-sm font-semibold text-ink-900">{user?.name ?? user?.email}</p>
                  <p className="text-xs text-ink-400">{user ? roleLabel[user.role] : ''}</p>
                </div>
                <MenuLink to={`${prefix}/profile`} icon={UserIcon} label="Profile" onClick={() => setMenuOpen(false)} />
                <MenuLink to={`${prefix}/help`} icon={HelpCircle} label="Help & Support" onClick={() => setMenuOpen(false)} />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-danger-600 hover:bg-danger-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );

  function MenuLink({ to, icon: Icon, label, onClick }: { to: string; icon: typeof UserIcon; label: string; onClick: () => void }) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-primary-50 hover:text-primary-700"
      >
        <Icon className="h-4 w-4" /> {label}
      </Link>
    );
  }
}
