/** Format a numeric score with a % suffix */
export function formatScore(score: number | undefined | null): string {
  if (score == null) return 'N/A';
  return `${score}%`;
}

/** Derive badge color class from result status string */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Pass':
    case 'Approved':
    case 'Approved & Locked':
    case 'active':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    case 'Fail':
    case 'Rejected':
    case 'disabled':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    case 'Pending':
    case 'Pending TPO Review':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'Correction Requested':
      return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  }
}

/** Convert ISO timestamp to human-readable relative time */
export function toRelativeTime(iso: string | undefined | null): string {
  if (!iso) return 'Unknown';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Derive recruiter initials for avatar */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');
}

/** Download a Blob as a named file */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build a CSV string from an array of objects */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => JSON.stringify(row[h] ?? '')).join(','),
    ),
  ];
  return lines.join('\n');
}
