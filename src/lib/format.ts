/** Formatting helpers shared by pages and calculator islands. */

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Formats seconds as a compact human duration, e.g. "1y 2mo", "18d 4h", "45m". */
export function fmtDuration(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return '0m';
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);

  // Assume a builder grinds ~24/7 is unrealistic for humans, but game time
  // is real time, so we report calendar truth and let the note explain it.
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30.44);
    return months > 0 ? `${years}y ${months}mo` : `${years}y`;
  }
  if (days >= 30.44) {
    const months = Math.floor(days / 30.44);
    const remDays = Math.floor(days % 30.44);
    return remDays > 0 ? `${months}mo ${remDays}d` : `${months}mo`;
  }
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/** Same as fmtDuration but always spelled out for prose, e.g. "3 months 12 days". */
export function fmtDurationLong(totalSec: number): string {
  const short = fmtDuration(totalSec);
  return short
    .replace(/y /, 'yrs ')
    .replace(/^(\d+)y$/, '$1yrs')
    .replace(/mo /, 'mos ')
    .replace(/^(\d+)mo$/, '$1mos')
    .replace(/d /, 'days ')
    .replace(/^(\d+)d$/, '$1 days')
    .replace(/h /, 'hrs ')
    .replace(/^(\d+)h$/, '$1 hrs')
    .replace(/m$/, 'min')
    .replace(/^(\d+)m$/, '$1 min');
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** "2 builders" style pluralization. */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
