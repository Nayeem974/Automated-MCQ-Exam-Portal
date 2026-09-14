import { Link } from 'react-router-dom';
import { ChevronRight, ClipboardList } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import EmptyState from '../common/EmptyState';
import { formatDate, scoreTone } from '../../lib/format';

export interface RecentResultItem {
  id: string;
  examTitle: string;
  percentage: number;
  date: string | Date;
  to: string;
}

const toneClasses: Record<ReturnType<typeof scoreTone>, string> = {
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

export default function RecentResults({ items, seeAllTo }: { items: RecentResultItem[]; seeAllTo?: string }) {
  return (
    <Card>
      <CardHeader
        title="Recent Results"
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
          icon={<ClipboardList className="h-5 w-5" />}
          title="No results yet"
          description="Finish an exam and your score will show up here."
        />
      ) : (
        <ul className="-mx-2 space-y-1">
          {items.slice(0, 5).map((item) => {
            const tone = scoreTone(item.percentage);
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-primary-50"
                >
                  <span
                    className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${toneClasses[tone]}`}
                  >
                    {Math.round(item.percentage)}%
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{item.examTitle}</span>
                    <span className="block truncate text-xs text-ink-400">{formatDate(item.date)}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
