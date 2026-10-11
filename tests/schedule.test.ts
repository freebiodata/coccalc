import { describe, expect, it } from 'vitest';
import { scheduleBuilders, projectDate } from '@lib/schedule';

describe('scheduleBuilders (LPT greedy)', () => {
  it('splits evenly divisible work', () => {
    const r = scheduleBuilders([100, 100, 100, 100], 2);
    expect(r.makespanSec).toBe(200);
    expect(r.totalWorkSec).toBe(400);
    expect(r.lowerBoundSec).toBe(200);
  });

  it('handles indivisible leftovers', () => {
    // Three 10s on two builders: LPT gives 10,10 then 10 on the first free -> 20.
    const r = scheduleBuilders([10, 10, 10], 2);
    expect(r.makespanSec).toBe(20);
    expect(r.lowerBoundSec).toBe(15);
  });

  it('is within 4/3 of optimal on a classic case', () => {
    // Optimal makespan is 15 (8+7 vs 6+5+4); LPT gives 17. 17 <= 4/3 * 15.
    const r = scheduleBuilders([8, 7, 6, 5, 4], 2);
    expect(r.makespanSec).toBe(17);
    expect(r.makespanSec).toBeLessThanOrEqual(Math.ceil((15 * 4) / 3));
  });

  it('never exceeds the single builder time', () => {
    const jobs = [500, 400, 300, 200, 100];
    const one = scheduleBuilders(jobs, 1);
    const three = scheduleBuilders(jobs, 3);
    expect(one.makespanSec).toBe(1500);
    expect(three.makespanSec).toBeLessThanOrEqual(1500);
    expect(three.makespanSec).toBeGreaterThanOrEqual(three.lowerBoundSec);
  });

  it('ignores zero and negative durations', () => {
    const r = scheduleBuilders([100, 0, -5, 50], 2);
    expect(r.totalWorkSec).toBe(150);
    expect(r.makespanSec).toBe(100);
  });

  it('handles empty job lists', () => {
    const r = scheduleBuilders([], 5);
    expect(r.makespanSec).toBe(0);
    expect(r.totalWorkSec).toBe(0);
  });

  it('clamps builders to at most the job count', () => {
    const r = scheduleBuilders([10, 20], 6);
    expect(r.builders).toBe(2);
    expect(r.makespanSec).toBe(20);
  });
});

describe('projectDate', () => {
  it('adds seconds to a start date', () => {
    const start = Date.UTC(2026, 9, 11);
    expect(projectDate(start, 86400).toISOString()).toBe('2026-10-12T00:00:00.000Z');
    expect(projectDate(start, 0).getTime()).toBe(start);
  });
});
