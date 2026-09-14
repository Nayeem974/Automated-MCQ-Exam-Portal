import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import EmptyState from '../common/EmptyState';
import { formatDate, formatTime } from '../../lib/format';

export interface UpcomingExamItem {
  id: string;
  title: string;
  courseTitle?: string;
  when: string | Date | null;
  to: string;
}

export default function UpcomingExams({ items, seeAllTo }: { items: UpcomingExamItem[]; seeAllTo?: string }) {
  return (
    <Card>
      <CardHeader
        title="Upcoming Exams"
        action={
          seeAllTo && (
            <Link to={seeAllTo} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              See all
            </Link>
          )
        }
      />
      {items.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarClock className="h-5 w-5" />}
          title="Nothing scheduled"
          description="Newly published exams for your courses will show up here."
        />
      ) : (
        <ul className="-mx-2 space-y-1">
          {items.slice(0, 5).map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-primary-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <CalendarClock className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{item.title}</span>
                  <span className="block truncate text-xs text-ink-400">
                    {item.when ? `${formatDate(item.when)} · ${formatTime(item.when)}` : 'Open now'}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
