/**
 * Parses Clash of Clans wiki duration strings such as "30s", "5m", "2h",
 * "1d 12h", "2d 12h 30m" into seconds. Returns null for empty or unparsable
 * input so bad data is caught by tests instead of silently becoming 0.
 */
export function parseDuration(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase();
  if (s === '' || s === '-' || s === 'n/a' || s === 'na') return null;
  if (s === 'instant' || s === '0s' || s === '0') return 0;

  const tokens = s.match(/(\d+(?:\.\d+)?)\s*(d|h|m|s)/g);
  if (!tokens || tokens.length === 0) return null;

  let total = 0;
  for (const token of tokens) {
    const m = token.match(/^(\d+(?:\.\d+)?)\s*(d|h|m|s)$/);
    if (!m) return null;
    const value = Number(m[1]);
    if (!Number.isFinite(value)) return null;
    switch (m[2]) {
      case 'd':
        total += value * 86400;
        break;
      case 'h':
        total += value * 3600;
        break;
      case 'm':
        total += value * 60;
        break;
      case 's':
        total += value;
        break;
    }
  }
  return Math.round(total);
}

/** Parses durations across a data file at build/dev time; throws on bad values. */
export function parseDurationStrict(raw: string, context: string): number {
  const secs = parseDuration(raw);
  if (secs == null) {
    throw new Error(`Unparsable duration "${raw}" in ${context}`);
  }
  return secs;
}
