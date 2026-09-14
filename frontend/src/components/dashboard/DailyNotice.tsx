import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import { formatDate } from '../../lib/format';

export interface NoticeItem {
  id: string;
  text: string;
  date: string | Date;
  tone?: 'primary' | 'success' | 'warning';
}

const dotTone: Record<NonNullable<NoticeItem['tone']>, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
};

// There's no announcements/notices model on the backend yet, so this card
// is wired to accept real data the moment `GET /notices` (or similar)
// exists. Until then it shows an honest "not enabled" state rather than
// fabricated announcements — see the redesign report for details.
export default function DailyNotice({ notices, seeAllTo }: { notices?: NoticeItem[]; seeAllTo?: string }) {
  return (
    <Card>
      <CardHeader
        title="Daily Notice"
        action={
          seeAllTo && (
            <Link to={seeAllTo} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              See all
            </Link>
          )
        }
      />
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <Megaphone className="h-6 w-6" strokeWidth={2.25} />
        </div>

        {!notices || notices.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-sm font-semibold text-ink-700">No announcements yet</p>
            <p className="mt-0.5 text-xs text-ink-400">
              Your institution hasn't enabled announcements for this portal yet. Once they do, exam schedules and
              updates from your teachers will show up here.
            </p>
          </div>
        ) : (
          <ul className="flex-1 space-y-2.5">
            {notices.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 text-sm">
                <span className="flex items-start gap-2.5 text-ink-700">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotTone[n.tone ?? 'primary']}`} />
                  {n.text}
                </span>
                <span className="shrink-0 whitespace-nowrap text-xs text-ink-400">{formatDate(n.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
