// Small, dependency-free formatting helpers shared across the dashboard UI.
// Centralized here so date/score/initials formatting stays consistent
// instead of being re-implemented slightly differently in every component.

export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || '';
  if (!source) return '?';
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function getFirstName(name?: string | null): string {
  if (!name) return 'there';
  return name.trim().split(/\s+/)[0] ?? 'there';
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function formatRelativeToNow(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMin);
  if (abs < 1) return 'just now';
  if (abs < 60) return diffMin > 0 ? `in ${abs}m` : `${abs}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return diffHr > 0 ? `in ${Math.abs(diffHr)}h` : `${Math.abs(diffHr)}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return diffDay > 0 ? `in ${Math.abs(diffDay)}d` : `${Math.abs(diffDay)}d ago`;
}

export type ScoreTone = 'success' | 'warning' | 'danger';

// Shared thresholds for coloring score badges/progress bars across the app
// (result rows, question performance, leaderboard, etc.)
export function scoreTone(percentage: number): ScoreTone {
  if (percentage >= 75) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}
