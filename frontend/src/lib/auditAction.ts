import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  ListChecks,
  LogIn,
  UserCog,
  UserMinus,
  UserPlus,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '../components/common';

// Mirrors the exact `action` string constants written by AuditLogService
// across the backend (courses, exams, questions, users, auth). Kept as a
// lookup rather than a naming convention parser, since it's a small,
// fixed, enum-like set.
const ACTIONS: Record<string, { label: string; icon: LucideIcon; tone: BadgeTone }> = {
  COURSE_CREATED: { label: 'Created a course', icon: BookOpen, tone: 'success' },
  COURSE_UPDATED: { label: 'Updated a course', icon: BookOpen, tone: 'info' },
  COURSE_DELETED: { label: 'Deleted a course', icon: BookOpen, tone: 'danger' },
  EXAM_CREATED: { label: 'Created an exam', icon: ClipboardList, tone: 'success' },
  EXAM_UPDATED: { label: 'Updated an exam', icon: ClipboardList, tone: 'info' },
  EXAM_PUBLISHED: { label: 'Published an exam', icon: ClipboardList, tone: 'primary' },
  EXAM_CLOSED: { label: 'Closed an exam', icon: ClipboardList, tone: 'neutral' },
  EXAM_DELETED: { label: 'Deleted an exam', icon: ClipboardList, tone: 'danger' },
  QUESTION_CREATED: { label: 'Added a question', icon: ListChecks, tone: 'success' },
  QUESTION_UPDATED: { label: 'Updated a question', icon: ListChecks, tone: 'info' },
  QUESTION_DELETED: { label: 'Deleted a question', icon: ListChecks, tone: 'danger' },
  USER_CREATED: { label: 'Created a user', icon: UserPlus, tone: 'success' },
  USER_UPDATED: { label: 'Updated a user', icon: UserCog, tone: 'info' },
  USER_DELETED: { label: 'Deleted a user', icon: UserMinus, tone: 'danger' },
  USER_ENABLED: { label: 'Enabled a user', icon: UserCog, tone: 'success' },
  USER_DISABLED: { label: 'Disabled a user', icon: UserX, tone: 'warning' },
  USER_REGISTERED: { label: 'Registered an account', icon: UserPlus, tone: 'primary' },
  USER_LOGIN: { label: 'Signed in', icon: LogIn, tone: 'neutral' },
};

const FALLBACK = { label: 'Activity', icon: HelpCircle, tone: 'neutral' as BadgeTone };

export function describeAction(action: string): { label: string; icon: LucideIcon; tone: BadgeTone } {
  return ACTIONS[action] ?? FALLBACK;
}
