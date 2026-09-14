import { useEffect, useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar, Badge, Card, EmptyState, ErrorState, SkeletonRow } from '../../components/common';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { describeAction } from '../../lib/auditAction';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string } | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    api
      .get<AuditLogEntry[]>('/audit-logs?limit=200')
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load audit logs'));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!logs) return [];
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter((l) =>
      `${l.action} ${l.entityType ?? ''} ${l.user?.name ?? ''} ${l.user?.email ?? ''}`.toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <DashboardLayout
      title="Audit Logs"
      description="Recent security-relevant actions across the whole platform."
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="h-10 w-56 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300"
          />
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && logs === null && (
        <Card padded={false}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      )}

      {!error && logs !== null && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<Activity className="h-6 w-6" />}
            title={logs.length === 0 ? 'No activity recorded yet' : 'No logs match your search'}
          />
        </Card>
      )}

      {!error && logs !== null && filtered.length > 0 && (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Actor</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100/60">
                {filtered.map((l) => {
                  const meta = describeAction(l.action);
                  return (
                    <tr key={l.id}>
                      <td className="whitespace-nowrap px-5 py-3 text-ink-400">{formatDateTime(l.createdAt)}</td>
                      <td className="px-5 py-3">
                        {l.user ? (
                          <div className="flex items-center gap-2.5">
                            <Avatar name={l.user.name} email={l.user.email} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-800">{l.user.name}</p>
                              <p className="text-xs text-ink-400">{l.user.role}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-400">System</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={meta.tone} className="whitespace-nowrap">
                          <meta.icon className="h-3 w-3" /> {meta.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-400">
                        {l.entityType ? `${l.entityType} · ${l.entityId?.slice(0, 8)}…` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
