/**
 * Cost and time aggregation for CoCPlanner.
 *
 * Definitions used everywhere in this module:
 * - "Segment TH X" is the set of upgrades that become available when you
 *   reach Town Hall X, assuming everything was maxed for TH X-1. This is
 *   what players mean by "the cost of TH X".
 * - "From TH X" totals sum segments X..MAX_TH, i.e. everything remaining
 *   for a player who just arrived at TH X with a maxed TH X-1 base.
 * - Heroes, pets and laboratory research never occupy a builder, so they
 *   run on their own parallel tracks (one per hero/pet, one shared lab).
 * - Wall upgrades are instant: they add cost, never builder time.
 */
import {
  BUILDINGS,
  HEROES,
  PETS,
  RESEARCH,
  WALL_COUNTS_BY_TH,
  WALL_LEVELS,
  MAX_TH,
  RESEARCH_TH_COMPLETE,
  PETS_TH_COMPLETE,
} from '@data/game';
import type { BuildingDef, LevelRow, Totals } from '@data/types';
import { scheduleBuilders, type ScheduleResult } from './schedule';

export { MAX_TH };

export interface CalcOptions {
  includeWalls: boolean;
  includeLab: boolean;
  includeHeroes: boolean;
  includePets: boolean;
}

export const DEFAULT_OPTIONS: CalcOptions = {
  includeWalls: true,
  includeLab: true,
  includeHeroes: true,
  includePets: true,
};

export function emptyTotals(): Totals {
  return { gold: 0, elixir: 0, dark: 0 };
}

export function addTotals(a: Totals, b: Totals): Totals {
  return { gold: a.gold + b.gold, elixir: a.elixir + b.elixir, dark: a.dark + b.dark };
}

/** Highest level of `levels` available at Town Hall `th`. */
export function maxLevelAtTH(levels: LevelRow[], th: number): number {
  let max = 0;
  for (const row of levels) {
    if (row.th != null && row.th <= th && row.level > max) max = row.level;
  }
  return max;
}

/** Levels with `fromLevel < level <= toLevel`. */
export function levelsBetween(levels: LevelRow[], fromLevel: number, toLevel: number): LevelRow[] {
  if (toLevel <= fromLevel) return [];
  return levels.filter((r) => r.level > fromLevel && r.level <= toLevel);
}

export function sumCost(levels: LevelRow[]): number {
  return levels.reduce((acc, r) => acc + (r.cost || 0), 0);
}

export function sumTime(levels: LevelRow[]): number {
  return levels.reduce((acc, r) => acc + (r.time || 0), 0);
}

function countAtTH(counts: number[], th: number): number {
  if (th <= 0) return 0;
  const idx = th - 1;
  return idx < counts.length ? counts[idx] : (counts[counts.length - 1] ?? 0);
}

/**
 * Upgrades a single building type needs inside segment TH X, expanded per
 * copy. Existing copies (count at X-1) go from maxAt(X-1)+1 to maxAt(X);
 * new copies (count difference) build from level 1.
 */
export function buildingSegmentLevels(def: BuildingDef, th: number): LevelRow[] {
  const maxNow = maxLevelAtTH(def.levels, th);
  const maxPrev = maxLevelAtTH(def.levels, th - 1);
  if (maxNow <= maxPrev) return [];
  const existing = levelsBetween(def.levels, maxPrev, maxNow);
  const fresh = levelsBetween(def.levels, 0, maxNow);
  const countPrev = def.category === 'wall' ? 0 : countAtTH(def.countsByTH, th - 1);
  const countNow = def.category === 'wall' ? 0 : countAtTH(def.countsByTH, th);
  const added = Math.max(0, countNow - countPrev);
  const rows: LevelRow[] = [];
  // New slots unlocked at this TH build from level 1; existing slots only
  // need the levels newly available at this TH.
  for (let c = 0; c < added; c++) rows.push(...fresh);
  for (let c = 0; c < Math.min(countPrev, countNow); c++) rows.push(...existing);
  return rows;
}

/** Wall costs inside segment TH X (all walls go to the new max level). */
export function wallSegment(th: number): { cost: number; levels: WallLevelRowLike[] } {
  const maxNow = maxLevelAtTH(WALL_LEVELS as LevelRow[], th);
  const maxPrev = maxLevelAtTH(WALL_LEVELS as LevelRow[], th - 1);
  const between = WALL_LEVELS.filter((r) => r.level > maxPrev && r.level <= maxNow);
  const count = countAtTH(WALL_COUNTS_BY_TH, th);
  return { cost: count * sumCost(between), levels: between };
}
type WallLevelRowLike = (typeof WALL_LEVELS)[number];

/** Cost/time of one building's upgrade path from level a to level b. */
export function upgradePath(def: { levels: LevelRow[] }, fromLevel: number, toLevel: number) {
  const rows = levelsBetween(def.levels, fromLevel, toLevel);
  return {
    rows,
    cost: sumCost(rows),
    timeSec: sumTime(rows),
    count: rows.length,
  };
}

export interface NamedJob {
  name: string;
  level: number;
  timeSec: number;
  cost: number;
  resource: 'gold' | 'elixir' | 'dark';
}

export interface SegmentBreakdown {
  th: number;
  totals: Totals;
  /** Builder job durations (seconds) for every copy of every building/trap. */
  builderJobs: number[];
  /** Same jobs with building name and level, for display. */
  namedJobs: NamedJob[];
  /** Sequential research seconds on the single laboratory. */
  labSec: number;
  /** Remaining seconds per hero id inside this segment. */
  heroSec: Record<string, number>;
  /** Remaining seconds per pet id inside this segment. */
  petSec: Record<string, number>;
  builderSchedule: ScheduleResult | null;
}

function heroSegmentSec(hero: { levels: LevelRow[] }, th: number): number {
  const maxNow = maxLevelAtTH(hero.levels, th);
  const maxPrev = maxLevelAtTH(hero.levels, th - 1);
  return sumTime(levelsBetween(hero.levels, maxPrev, maxNow));
}

function heroSegmentCost(hero: { levels: LevelRow[]; resource: string }, th: number): number {
  const maxNow = maxLevelAtTH(hero.levels, th);
  const maxPrev = maxLevelAtTH(hero.levels, th - 1);
  return sumCost(levelsBetween(hero.levels, maxPrev, maxNow));
}

/** Full breakdown of segment TH X. */
export function segmentBreakdown(th: number, opts: CalcOptions = DEFAULT_OPTIONS): SegmentBreakdown {
  const totals = emptyTotals();
  const builderJobs: number[] = [];
  const namedJobs: NamedJob[] = [];
  const heroSec: Record<string, number> = {};
  const petSec: Record<string, number> = {};
  let labSec = 0;

  for (const def of BUILDINGS) {
    if (def.category === 'wall') continue;
    const rows = buildingSegmentLevels(def, th);
    if (rows.length === 0) continue;
    const cost = sumCost(rows);
    if (def.resource === 'gold') totals.gold += cost;
    else if (def.resource === 'elixir') totals.elixir += cost;
    else totals.dark += cost;
    for (const r of rows) {
      namedJobs.push({ name: def.name, level: r.level, timeSec: r.time, cost: r.cost, resource: def.resource });
      if (r.time > 0) builderJobs.push(r.time);
    }
  }

  if (opts.includeWalls) {
    const wall = wallSegment(th);
    // Walls can be paid with gold at every level and with elixir at the
    // levels the wiki marks as elixir-eligible; we count the gold price.
    totals.gold += wall.cost;
  }

  if (opts.includeHeroes) {
    for (const hero of HEROES) {
      const sec = heroSegmentSec(hero, th);
      if (sec > 0) heroSec[hero.id] = sec;
      const cost = heroSegmentCost(hero, th);
      if (defResource(hero.resource) === 'gold') totals.gold += cost;
      else if (defResource(hero.resource) === 'elixir') totals.elixir += cost;
      else totals.dark += cost;
    }
  }

  if (opts.includePets) {
    for (const pet of PETS) {
      const maxNow = maxLevelAtTH(pet.levels, th);
      const maxPrev = maxLevelAtTH(pet.levels, th - 1);
      const rows = levelsBetween(pet.levels, maxPrev, maxNow);
      if (rows.length === 0) continue;
      const cost = sumCost(rows);
      if (defResource(pet.resource) === 'gold') totals.gold += cost;
      else if (defResource(pet.resource) === 'elixir') totals.elixir += cost;
      else totals.dark += cost;
      const sec = sumTime(rows);
      if (sec > 0) petSec[pet.id] = sec;
    }
  }

  if (opts.includeLab) {
    for (const r of RESEARCH) {
      const maxNow = maxLevelAtTH(r.levels, th);
      const maxPrev = maxLevelAtTH(r.levels, th - 1);
      const rows = levelsBetween(r.levels, maxPrev, maxNow);
      if (rows.length === 0) continue;
      const cost = sumCost(rows);
      if (defResource(r.resource) === 'gold') totals.gold += cost;
      else if (defResource(r.resource) === 'elixir') totals.elixir += cost;
      else totals.dark += cost;
      labSec += sumTime(rows);
    }
  }

  return {
    th,
    totals,
    builderJobs,
    namedJobs,
    labSec,
    heroSec,
    petSec,
    builderSchedule: null,
  };
}

function defResource(r: string): 'gold' | 'elixir' | 'dark' {
  if (r === 'gold') return 'gold';
  if (r === 'elixir') return 'elixir';
  return 'dark';
}

export interface ProjectionOptions extends CalcOptions {
  builders: number;
}

export interface ThStep {
  th: number;
  totals: Totals;
  builderSec: number;
  labSec: number;
  heroSec: Record<string, number>;
  petSec: Record<string, number>;
  /** Cumulative wall-clock seconds from the start date to the end of this
   * TH segment on the critical path. */
  cumulativeSec: number;
  /** Finish date offset for this segment (epoch ms). */
  endMs: number;
}

export interface TimeToMaxResult {
  startTh: number;
  builders: number;
  steps: ThStep[];
  /** Builder department total (TH-ordered sum of segment makespans). */
  builderSec: number;
  builderWorkSec: number;
  builderLowerBoundSec: number;
  /** Longest single hero track (seconds), if heroes included. */
  heroSec: number;
  heroId: string | null;
  /** Longest pet track (seconds), if pets included. */
  petSec: number;
  petId: string | null;
  /** Total sequential research seconds, if lab included. */
  labSec: number;
  /** The critical path: max of builders, heroes, pets and lab. */
  totalSec: number;
  criticalPath: 'builders' | 'heroes' | 'pets' | 'lab';
  totals: Totals;
  researchThComplete: boolean;
  petsThComplete: boolean;
}

/**
 * Time and cost for a player who just arrived at `startTh` with a fully
 * maxed TH (startTh - 1) base, going to fully maxed MAX_TH.
 *
 * Model notes (also shown on the site):
 * - Buildings are upgraded in Town Hall order: each segment is scheduled
 *   with LPT across the builders, segments run back to back.
 * - Heroes (one track each), pets (one track each) and the single
 *   laboratory run in parallel with builders and with each other.
 * - Wall upgrades are instant and never block a builder.
 */
export function timeToMax(startTh: number, opts: ProjectionOptions): TimeToMaxResult {
  const builders = Math.max(1, Math.min(9, Math.round(opts.builders)));
  const steps: ThStep[] = [];
  const heroTotals: Record<string, number> = {};
  const petTotals: Record<string, number> = {};
  const totals = emptyTotals();
  let builderSec = 0;
  let builderWorkSec = 0;
  let builderLowerBoundSec = 0;
  let labSec = 0;

  for (let th = startTh; th <= MAX_TH; th++) {
    const seg = segmentBreakdown(th, opts);
    const sched = scheduleBuilders(seg.builderJobs, builders);
    builderSec += sched.makespanSec;
    builderWorkSec += sched.totalWorkSec;
    builderLowerBoundSec += sched.lowerBoundSec;
    labSec += seg.labSec;
    for (const [id, sec] of Object.entries(seg.heroSec)) {
      heroTotals[id] = (heroTotals[id] ?? 0) + sec;
    }
    for (const [id, sec] of Object.entries(seg.petSec)) {
      petTotals[id] = (petTotals[id] ?? 0) + sec;
    }
    totals.gold += seg.totals.gold;
    totals.elixir += seg.totals.elixir;
    totals.dark += seg.totals.dark;
    steps.push({
      th,
      totals: seg.totals,
      builderSec: sched.makespanSec,
      labSec: seg.labSec,
      heroSec: seg.heroSec,
      petSec: seg.petSec,
      cumulativeSec: builderSec,
      endMs: 0,
    });
  }

  let heroSec = 0;
  let heroId: string | null = null;
  for (const [id, sec] of Object.entries(heroTotals)) {
    if (sec > heroSec) {
      heroSec = sec;
      heroId = id;
    }
  }
  let petSec = 0;
  let petId: string | null = null;
  for (const [id, sec] of Object.entries(petTotals)) {
    if (sec > petSec) {
      petSec = sec;
      petId = id;
    }
  }

  const candidates: Array<[TimeToMaxResult['criticalPath'], number]> = [
    ['builders', builderSec],
    ['heroes', heroSec],
    ['pets', petSec],
    ['lab', labSec],
  ];
  candidates.sort((a, b) => b[1] - a[1]);
  const [criticalPath, totalSec] = candidates[0];

  // Fill cumulative timeline on the critical path for calendar projection.
  let running: number;
  if (criticalPath === 'builders') {
    running = 0;
    for (const step of steps) {
      running += step.builderSec;
      step.cumulativeSec = running;
    }
  } else if (criticalPath === 'lab') {
    running = 0;
    for (const step of steps) {
      running += step.labSec;
      step.cumulativeSec = running;
    }
  } else if (criticalPath === 'heroes') {
    // Attribute hero track time proportionally to segments where that hero
    // has upgrades, so the calendar stays meaningful.
    running = 0;
    for (const step of steps) {
      running += step.heroSec[heroId ?? ''] ?? 0;
      step.cumulativeSec = running;
    }
  } else {
    running = 0;
    for (const step of steps) {
      running += step.petSec[petId ?? ''] ?? 0;
      step.cumulativeSec = running;
    }
  }

  return {
    startTh,
    builders,
    steps,
    builderSec,
    builderWorkSec,
    builderLowerBoundSec,
    heroSec,
    heroId,
    petSec,
    petId,
    labSec,
    totalSec,
    criticalPath,
    totals,
    researchThComplete: RESEARCH_TH_COMPLETE,
    petsThComplete: PETS_TH_COMPLETE,
  };
}

/** Pure cost totals for segment TH X (no time model). */
export function segmentTotals(th: number, opts: CalcOptions = DEFAULT_OPTIONS): Totals {
  return segmentBreakdown(th, opts).totals;
}

/** Cost totals for everything remaining from TH `fromTh` to max. */
export function costToMaxFrom(fromTh: number, opts: CalcOptions = DEFAULT_OPTIONS): Totals {
  const totals = emptyTotals();
  for (let th = fromTh; th <= MAX_TH; th++) {
    const seg = segmentTotals(th, opts);
    totals.gold += seg.gold;
    totals.elixir += seg.elixir;
    totals.dark += seg.dark;
  }
  return totals;
}

/** Cost to take a single wall count between two wall levels. */
export function wallCost(fromLevel: number, toLevel: number, count: number) {
  const between = WALL_LEVELS.filter((r) => r.level > fromLevel && r.level <= toLevel);
  const perWall = sumCost(between);
  return {
    perWall,
    total: perWall * count,
    levels: between,
  };
}

export function wallLevelCount(): number {
  return WALL_LEVELS.length;
}
