/**
 * Builder scheduling for Clash of Clans upgrade planning.
 *
 * Model: every upgrade that occupies a builder is a job with a duration.
 * N builders work in parallel; a builder takes one job at a time. We use the
 * LPT (longest processing time first) greedy list schedule: sort jobs by
 * duration descending and always assign the next job to the builder who
 * becomes free earliest. LPT is within 4/3 of the optimal makespan, which is
 * far tighter than the rounding of real upgrade lists, and it is the order
 * experienced players follow anyway (long upgrades first).
 */

export interface ScheduleResult {
  /** Total wall-clock seconds until the last job finishes. */
  makespanSec: number;
  /** Sum of all job durations in seconds. */
  totalWorkSec: number;
  /** Number of builders used (clamped to [1, jobs]). */
  builders: number;
  /** Finish time (offset in seconds from start) per builder slot. */
  builderEnds: number[];
  /** Theoretical lower bound: totalWork / builders, rounded up. */
  lowerBoundSec: number;
  /** Jobs (durations, seconds) sorted the way they were scheduled. */
  scheduledJobs: number[];
}

export function scheduleBuilders(jobsSec: number[], builders: number): ScheduleResult {
  const jobs = jobsSec.filter((t) => t > 0);
  const n = Math.max(1, Math.min(builders, Math.max(1, jobs.length)));
  const sorted = [...jobs].sort((a, b) => b - a);
  const ends = new Array(n).fill(0);

  for (const job of sorted) {
    // Assign to the builder that becomes free earliest.
    let earliest = 0;
    for (let i = 1; i < n; i++) {
      if (ends[i] < ends[earliest]) earliest = i;
    }
    ends[earliest] += job;
  }

  const totalWork = jobs.reduce((a, b) => a + b, 0);
  const makespan = ends.length > 0 ? Math.max(...ends) : 0;

  return {
    makespanSec: makespan,
    totalWorkSec: totalWork,
    builders: n,
    builderEnds: ends,
    lowerBoundSec: Math.ceil(totalWork / n),
    scheduledJobs: sorted,
  };
}

/** Projects a finish date `secondsSec` from a given start (ms epoch). */
export function projectDate(startMs: number, secondsSec: number): Date {
  return new Date(startMs + secondsSec * 1000);
}
