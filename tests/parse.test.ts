import { describe, expect, it } from 'vitest';
import { parseDuration, parseDurationStrict } from '@lib/parse';

describe('parseDuration', () => {
  it('parses simple units', () => {
    expect(parseDuration('30s')).toBe(30);
    expect(parseDuration('5m')).toBe(300);
    expect(parseDuration('2h')).toBe(7200);
    expect(parseDuration('1d')).toBe(86400);
    expect(parseDuration('14d')).toBe(1209600);
  });

  it('parses combined units', () => {
    expect(parseDuration('1d 12h')).toBe(129600);
    expect(parseDuration('2d 12h 30m')).toBe(217800);
    expect(parseDuration('9d 16h')).toBe(835200);
    expect(parseDuration('15d 6h')).toBe(1317600);
    expect(parseDuration('3d 6h')).toBe(280800);
  });

  it('handles instant and empty', () => {
    expect(parseDuration('instant')).toBe(0);
    expect(parseDuration('0s')).toBe(0);
    expect(parseDuration('0')).toBe(0);
    expect(parseDuration('')).toBeNull();
    expect(parseDuration(null)).toBeNull();
    expect(parseDuration('N/A')).toBeNull();
  });

  it('rejects junk instead of silently returning 0', () => {
    expect(parseDuration('soon')).toBeNull();
    expect(parseDuration('12x')).toBeNull();
    expect(parseDuration('?')).toBeNull();
  });

  it('strict variant throws with context', () => {
    expect(() => parseDurationStrict('soon', 'cannon level 4')).toThrow(/cannon level 4/);
    expect(parseDurationStrict('1d 12h', 'test')).toBe(129600);
  });
});
