import {
  LayoutDashboard,
  FileText,
  Award,
  BookMarked,
  PenLine,
  User,
  Bell,
  LifeBuoy,
  GraduationCap,
  ClipboardList,
  Users,
  BookOpen,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { CurrentUser } from '../../lib/api';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', to: '/student', icon: LayoutDashboard, end: true },
  { label: 'My Exams', to: '/student/exams', icon: FileText },
  { label: 'Results', to: '/student/results', icon: Award },
  { label: 'Question Bank', to: '/student/question-bank', icon: BookMarked },
  { label: 'Practice Test', to: '/student/practice', icon: PenLine },
  { label: 'Profile', to: '/student/profile', icon: User },
  { label: 'Notifications', to: '/student/notifications', icon: Bell },
  { label: 'Help & Support', to: '/student/help', icon: LifeBuoy },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard, end: true },
  { label: 'Courses', to: '/teacher/courses', icon: BookOpen },
  { label: 'Exams', to: '/teacher/exams', icon: ClipboardList },
  { label: 'Profile', to: '/teacher/profile', icon: User },
  { label: 'Notifications', to: '/teacher/notifications', icon: Bell },
  { label: 'Help & Support', to: '/teacher/help', icon: LifeBuoy },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Courses', to: '/admin/courses', icon: BookOpen },
  { label: 'Exams', to: '/admin/exams', icon: ClipboardList },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck },
  { label: 'Profile', to: '/admin/profile', icon: User },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Help & Support', to: '/admin/help', icon: LifeBuoy },
];

export function getNavForRole(role: CurrentUser['role'] | undefined): NavItem[] {
  if (role === 'TEACHER') return teacherNav;
  if (role === 'ADMIN') return adminNav;
  return studentNav;
}

export const roleLabel: Record<CurrentUser['role'], string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ADMIN: 'Administrator',
};

export function rolePrefix(role: CurrentUser['role'] | undefined): string {
  if (role === 'TEACHER') return '/teacher';
  if (role === 'ADMIN') return '/admin';
  return '/student';
}

export const roleIcon: Record<CurrentUser['role'], LucideIcon> = {
  STUDENT: GraduationCap,
  TEACHER: BookOpen,
  ADMIN: ShieldCheck,
};
