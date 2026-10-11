import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OPTIONS,
  costToMaxFrom,
  levelsBetween,
  maxLevelAtTH,
  segmentTotals,
  timeToMax,
  upgradePath,
  wallCost,
} from '@lib/calc';
import type { LevelRow } from '@data/types';

const fixture: LevelRow[] = [
  { level: 1, cost: 100, time: 60, th: 1 },
  { level: 2, cost: 200, time: 120, th: 2 },
  { level: 3, cost: 400, time: 240, th: 4 },
  { level: 4, cost: 800, time: 480, th: 4 },
];

describe('level helpers', () => {
  it('maxLevelAtTH respects TH gating', () => {
    expect(maxLevelAtTH(fixture, 1)).toBe(1);
    expect(maxLevelAtTH(fixture, 2)).toBe(2);
    expect(maxLevelAtTH(fixture, 3)).toBe(2);
    expect(maxLevelAtTH(fixture, 4)).toBe(4);
    expect(maxLevelAtTH(fixture, 0)).toBe(0);
  });

  it('levelsBetween is exclusive of the from level', () => {
    expect(levelsBetween(fixture, 0, 2).map((r) => r.level)).toEqual([1, 2]);
    expect(levelsBetween(fixture, 2, 4).map((r) => r.level)).toEqual([3, 4]);
    expect(levelsBetween(fixture, 4, 4)).toEqual([]);
    expect(levelsBetween(fixture, 3, 2)).toEqual([]);
  });

  it('upgradePath sums costs and times', () => {
    const path = upgradePath({ levels: fixture }, 1, 3);
    expect(path.cost).toBe(200 + 400);
    expect(path.timeSec).toBe(120 + 240);
    expect(path.count).toBe(2);
    const fromZero = upgradePath({ levels: fixture }, 0, 3);
    expect(fromZero.cost).toBe(100 + 200 + 400);
  });
});

describe('real dataset sanity (TH9 to TH10 hand check)', () => {
  it('segment totals equal cumulative differences', () => {
    const th10 = costToMaxFrom(10, DEFAULT_OPTIONS);
    const th11 = costToMaxFrom(11, DEFAULT_OPTIONS);
    const seg10 = segmentTotals(10, DEFAULT_OPTIONS);
    expect(seg10.gold).toBe(th10.gold - th11.gold);
    expect(seg10.elixir).toBe(th10.elixir - th11.elixir);
    expect(seg10.dark).toBe(th10.dark - th11.dark);
  });

  it('cumulative totals are monotonically decreasing in TH', () => {
    let prev = costToMaxFrom(1, DEFAULT_OPTIONS);
    for (let th = 2; th <= 17; th++) {
      const now = costToMaxFrom(th, DEFAULT_OPTIONS);
      expect(now.gold).toBeLessThanOrEqual(prev.gold);
      expect(now.elixir).toBeLessThanOrEqual(prev.elixir);
      expect(now.dark).toBeLessThanOrEqual(prev.dark);
      prev = now;
    }
  });

  it('costToMaxFrom(maxTH) equals the last segment only', () => {
    const last = costToMaxFrom(18, DEFAULT_OPTIONS);
    const seg = segmentTotals(18, DEFAULT_OPTIONS);
    expect(last.gold).toBe(seg.gold);
  });

  it('more builders never lengthen the builder track', () => {
    const five = timeToMax(10, { ...DEFAULT_OPTIONS, builders: 5 });
    const six = timeToMax(10, { ...DEFAULT_OPTIONS, builders: 6 });
    expect(six.builderSec).toBeLessThanOrEqual(five.builderSec);
    expect(five.builderWorkSec).toBe(six.builderWorkSec);
  });

  it('total time is the max of all tracks', () => {
    const r = timeToMax(10, { ...DEFAULT_OPTIONS, builders: 5 });
    const maxTrack = Math.max(r.builderSec, r.heroSec, r.labSec, r.petSec);
    expect(r.totalSec).toBe(maxTrack);
    expect(r.builderSec).toBeGreaterThanOrEqual(r.builderLowerBoundSec);
  });

  it('turning off lab and heroes shrinks or keeps total time', () => {
    const all = timeToMax(10, { ...DEFAULT_OPTIONS, builders: 5 });
    const none = timeToMax(10, { includeWalls: true, includeLab: false, includeHeroes: false, includePets: false, builders: 5 });
    expect(none.totalSec).toBeLessThanOrEqual(all.totalSec);
    expect(none.labSec).toBe(0);
    expect(none.heroSec).toBe(0);
  });
});

describe('wallCost', () => {
  it('prices a range times a count', () => {
    const res = wallCost(10, 12, 25);
    expect(res.levels.map((l) => l.level)).toEqual([11, 12]);
    expect(res.total).toBe(res.perWall * 25);
    expect(res.perWall).toBe(res.levels.reduce((a, l) => a + l.cost, 0));
  });

  it('returns zero for empty ranges', () => {
    const res = wallCost(12, 12, 300);
    expect(res.perWall).toBe(0);
    expect(res.total).toBe(0);
    expect(res.levels).toEqual([]);
  });
});
