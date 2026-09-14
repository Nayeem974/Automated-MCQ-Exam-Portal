import {
  Atom,
  BookOpen,
  Calculator,
  Code2,
  Database,
  FlaskConical,
  Globe2,
  Landmark,
  Network,
  type LucideIcon,
} from 'lucide-react';
import type { CoursePastel } from '../components/dashboard/CourseCard';

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/network/i, Network],
  [/database|\bdbms\b|sql/i, Database],
  [/program|software|\boop\b|java|python|algorithm/i, Code2],
  [/math|calculus|algebra|statistic/i, Calculator],
  [/physic|chemistry|biology|science/i, FlaskConical],
  [/history|civic|law|government/i, Landmark],
  [/english|language|literature/i, Globe2],
  [/electr|circuit|physics/i, Atom],
];

const PASTELS: CoursePastel[] = ['lavender', 'blue', 'green', 'amber'];

/** Deterministic (not random) so the same course always renders the same way across pages. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function subjectIcon(title: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(title));
  return match ? match[1] : BookOpen;
}

export function subjectPastel(seed: string): CoursePastel {
  return PASTELS[hashString(seed) % PASTELS.length];
}
