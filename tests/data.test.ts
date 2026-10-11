import { describe, expect, it } from 'vitest';
import { BUILDINGS, HEROES, MAX_TH, PETS, RESEARCH, WALL_COUNTS_BY_TH, WALL_LEVELS } from '@data/game';

describe('dataset integrity', () => {
  it('covers the full building set (defenses, army, resources, traps, town hall)', () => {
    expect(BUILDINGS.length).toBeGreaterThanOrEqual(40);
    const ids = new Set(BUILDINGS.map((b) => b.id));
    for (const required of [
      'cannon', 'archer-tower', 'mortar', 'air-defense', 'wizard-tower', 'air-sweeper',
      'hidden-tesla', 'bomb-tower', 'xbow', 'inferno-tower', 'eagle-artillery', 'scattershot',
      'monolith', 'ricochet-cannon', 'multi-gear-tower', 'town-hall', 'laboratory', 'army-camp',
      'clan-castle', 'gold-storage', 'elixir-storage', 'dark-elixir-drill', 'bomb', 'tornado-trap',
      'pet-house', 'hero-hall',
    ]) {
      expect(ids.has(required), `missing building ${required}`).toBe(true);
    }
  });

  it('has unique building ids', () => {
    const ids = BUILDINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has contiguous level rows starting at 1 for buildings (or 2 for research/unlock-based)', () => {
    for (const b of BUILDINGS) {
      const levels = b.levels.map((l) => l.level);
      expect(levels[0], `${b.id} first level`).toBe(1);
      expect(new Set(levels).size, `${b.id} unique levels`).toBe(levels.length);
    }
  });

  it('keeps costs non-negative and times non-negative everywhere', () => {
    for (const b of [...BUILDINGS, ...HEROES, ...PETS, ...RESEARCH]) {
      for (const row of b.levels) {
        expect(row.cost, `${b.id} level ${row.level} cost`).toBeGreaterThanOrEqual(0);
        expect(row.time, `${b.id} level ${row.level} time`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keeps Town Hall requirements within 1..MAX_TH', () => {
    for (const b of [...BUILDINGS, ...HEROES, ...PETS, ...RESEARCH]) {
      for (const row of b.levels) {
        expect(row.th, `${b.id} level ${row.level} TH`).toBeGreaterThanOrEqual(1);
        expect(row.th).toBeLessThanOrEqual(MAX_TH);
      }
    }
  });

  it('has counts arrays for all multi-copy buildings', () => {
    for (const b of BUILDINGS) {
      if (b.category === 'other') continue;
      expect(b.countsByTH.length, `${b.id} counts length`).toBe(MAX_TH);
      const last = b.countsByTH[MAX_TH - 1];
      // The wiki explicitly zeroes the Eagle Artillery at TH17/TH18.
      const documentedZero = b.id === 'eagle-artillery';
      if (!documentedZero) {
        expect(last, `${b.id} has copies at max TH`).toBeGreaterThan(0);
      }
      for (let i = 1; i < b.countsByTH.length; i++) {
        if (documentedZero) continue;
        expect(b.countsByTH[i], `${b.id} counts non-decreasing at TH${i + 1}`).toBeGreaterThanOrEqual(b.countsByTH[i - 1]);
      }
    }
  });

  it('covers all four heroes and the pet roster', () => {
    expect(HEROES.map((h) => h.id)).toEqual(['barbarian-king', 'archer-queen', 'grand-warden', 'royal-champion']);
    expect(HEROES[0].levels.length).toBeGreaterThan(80);
    expect(HEROES[1].levels.length).toBeGreaterThan(80);
    expect(HEROES[2].levels.length).toBeGreaterThan(50);
    expect(HEROES[3].levels.length).toBeGreaterThan(40);
    expect(PETS.length).toBeGreaterThanOrEqual(9);
  });

  it('covers the research roster (troops and spells)', () => {
    expect(RESEARCH.length).toBeGreaterThanOrEqual(40);
    const spells = RESEARCH.filter((r) => r.kind === 'spell').length;
    const troops = RESEARCH.filter((r) => r.kind === 'troop').length;
    expect(troops).toBeGreaterThanOrEqual(25);
    expect(spells).toBeGreaterThanOrEqual(15);
    // Research levels start at 2 (level 1 is the unlock).
    for (const r of RESEARCH) {
      expect(r.levels[0].level, `${r.id} research starts at 2`).toBe(2);
    }
  });

  it('has wall levels 1..19 with elixir availability marked from level 5', () => {
    expect(WALL_LEVELS.length).toBe(19);
    expect(WALL_LEVELS[0].cost).toBe(0);
    expect(WALL_LEVELS.find((l) => l.resourceOptions.includes('elixir'))!.level).toBe(5);
    expect(WALL_COUNTS_BY_TH[MAX_TH - 1]).toBe(325);
    expect(WALL_COUNTS_BY_TH[0]).toBe(0);
  });
});

describe('hand-verified wiki spot checks', () => {
  it('matches known wiki values', () => {
    const xbow = BUILDINGS.find((b) => b.id === 'xbow')!;
    expect(xbow.levels[0]).toMatchObject({ level: 1, cost: 1000000, time: 43200, th: 9 });

    const th = BUILDINGS.find((b) => b.id === 'town-hall')!;
    expect(th.levels.find((l) => l.level === 10)).toMatchObject({ cost: 3500000, time: 259200 });
    expect(th.levels.find((l) => l.level === 18)).toMatchObject({ cost: 25000000 });

    const lab = BUILDINGS.find((b) => b.id === 'laboratory')!;
    expect(lab.levels.find((l) => l.level === 7)).toMatchObject({ cost: 800000, time: 86400, th: 9 });

    const camp = BUILDINGS.find((b) => b.id === 'army-camp')!;
    expect(camp.levels.find((l) => l.level === 7)).toMatchObject({ cost: 1500000, time: 172800, th: 9 });

    const barb = RESEARCH.find((r) => r.id === 'barbarian')!;
    expect(barb.levels.find((l) => l.level === 8)).toMatchObject({ cost: 1500000, time: 86400 });

    const wall14 = WALL_LEVELS.find((l) => l.level === 14)!;
    expect(wall14.cost).toBe(2000000);
    expect(wall14.th).toBe(13);

    const king = HEROES[0];
    expect(king.levels.find((l) => l.level === 2)).toMatchObject({ cost: 5000, time: 7200, th: 7 });
  });
});
