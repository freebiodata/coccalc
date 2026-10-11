/**
 * Home village buildings and traps: per-level cost, build time and Town Hall
 * requirement, plus how many copies exist at each Town Hall level.
 * Source: Clash of Clans Wiki (clashofclans.fandom.com), snapshot 2026-10-11.
 * Rows are [level, cost, timeAsString, townHallRequired]; counts arrays are
 * indexed TH1..TH18. Durations parse at module load and throw on bad values.
 */
import { parseDurationStrict } from '../lib/parse';
import type { BuildingCategory, BuildingDef, LevelRow, ResourceKind } from './types';

export interface RawBuilding {
  id: string;
  name: string;
  category: BuildingCategory;
  resource: ResourceKind;
  rows: [number, number, string, number][];
  counts?: number[];
  source: string;
  note?: string;
}

export const RAW_BUILDINGS: RawBuilding[] = [
  {
    id: 'cannon', name: 'Cannon', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Cannon',
    note: 'Capped at level 21; from TH17 Cannons can be merged into the Ricochet Cannon. Wiki lists dual counts for TH17/TH18 (post-merge values in parentheses); pre-merge values used.',
    counts: [2, 2, 2, 2, 3, 3, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7],
    rows: [
      [1, 250, '5s', 1], [2, 1000, '30s', 1], [3, 4000, '2m', 2], [4, 16000, '20m', 3],
      [5, 50000, '30m', 4], [6, 60000, '1h', 5], [7, 100000, '2h', 6], [8, 160000, '3h', 7],
      [9, 250000, '3h 30m', 8], [10, 330000, '4h', 8], [11, 500000, '4h 30m', 9],
      [12, 600000, '5h', 10], [13, 660000, '6h', 10], [14, 1000000, '8h', 11],
      [15, 1200000, '10h', 11], [16, 1300000, '11h', 12], [17, 1500000, '12h', 12],
      [18, 1800000, '16h', 13], [19, 2000000, '20h', 13], [20, 2600000, '1d', 14],
      [21, 3000000, '1d 12h', 15],
    ],
  },
  {
    id: 'archer-tower', name: 'Archer Tower', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Archer_Tower',
    note: 'Capped at level 21; from TH17 mergeable into the Multi-Archer Tower. Wiki dual counts for TH17/TH18 are post-merge variants; pre-merge values used.',
    counts: [0, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 9],
    rows: [
      [1, 1000, '15s', 2], [2, 2000, '2m', 2], [3, 5000, '20m', 3], [4, 20000, '1h', 4],
      [5, 70000, '1h 30m', 5], [6, 80000, '2h', 5], [7, 150000, '3h', 6], [8, 200000, '4h', 7],
      [9, 400000, '5h', 8], [10, 460000, '6h', 8], [11, 600000, '7h', 9], [12, 700000, '8h', 10],
      [13, 1000000, '10h', 10], [14, 1100000, '11h', 11], [15, 1300000, '12h', 11],
      [16, 1600000, '16h', 12], [17, 1800000, '20h', 12], [18, 2000000, '1d', 13],
      [19, 2200000, '1d 6h', 13], [20, 3000000, '1d 12h', 14], [21, 4000000, '2d', 15],
    ],
  },
  {
    id: 'mortar', name: 'Mortar', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Mortar',
    counts: [0, 0, 1, 1, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    rows: [
      [1, 5000, '30m', 3], [2, 25000, '1h', 4], [3, 90000, '2h', 5], [4, 180000, '3h', 6],
      [5, 300000, '6h', 7], [6, 500000, '8h', 8], [7, 900000, '12h', 9], [8, 1200000, '18h', 10],
      [9, 1600000, '20h', 11], [10, 1800000, '1d', 11], [11, 2300000, '1d 6h', 12],
      [12, 2400000, '1d 12h', 12], [13, 2800000, '2d', 13], [14, 4300000, '2d 12h', 14],
      [15, 5000000, '3d', 15], [16, 7000000, '4d', 16], [17, 13000000, '5d', 17],
      [18, 21000000, '12d 12h', 18],
    ],
  },
  {
    id: 'air-defense', name: 'Air Defense', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Air_Defense',
    counts: [0, 0, 0, 1, 1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    rows: [
      [1, 22000, '1h', 4], [2, 90000, '2h', 4], [3, 210000, '6h', 5], [4, 500000, '12h', 6],
      [5, 800000, '18h', 7], [6, 1000000, '1d', 8], [7, 1750000, '2d', 9],
      [8, 2300000, '2d 12h', 10], [9, 3400000, '3d', 11], [10, 5000000, '4d', 12],
      [11, 5600000, '4d 12h', 13], [12, 6500000, '5d', 14], [13, 8000000, '6d', 15],
      [14, 9000000, '6d 12h', 16], [15, 15000000, '7d', 17], [16, 26000000, '13d 6h', 18],
    ],
  },
  {
    id: 'wizard-tower', name: 'Wizard Tower', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Wizard_Tower',
    note: 'Capped at level 17; mergeable into the Super Wizard Tower at TH18. Wiki TH18 dual count is the post-merge variant; pre-merge value used.',
    counts: [0, 0, 0, 0, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6],
    rows: [
      [1, 100000, '1h', 5], [2, 150000, '1h 30m', 5], [3, 250000, '4h', 6],
      [4, 400000, '8h', 7], [5, 550000, '10h', 8], [6, 660000, '12h', 8],
      [7, 1000000, '18h', 9], [8, 1100000, '20h', 10], [9, 1300000, '1d', 10],
      [10, 2000000, '1d 6h', 11], [11, 2500000, '1d 12h', 12], [12, 2600000, '1d 18h', 13],
      [13, 3000000, '2d', 13], [14, 4500000, '3d', 14], [15, 5500000, '4d', 15],
      [16, 8000000, '4d 12h', 16], [17, 14000000, '5d 12h', 17],
    ],
  },
  {
    id: 'air-sweeper', name: 'Air Sweeper', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Air_Sweeper',
    counts: [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    rows: [
      [1, 200000, '4h', 6], [2, 300000, '6h', 6], [3, 450000, '8h', 7],
      [4, 800000, '12h', 8], [5, 1200000, '1d', 9], [6, 1900000, '2d', 10],
      [7, 3400000, '3d', 11],
    ],
  },
  {
    id: 'hidden-tesla', name: 'Hidden Tesla', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Hidden_Tesla',
    counts: [0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5],
    rows: [
      [1, 250000, '2h', 7], [2, 350000, '3h', 7], [3, 500000, '4h', 7],
      [4, 600000, '6h', 8], [5, 800000, '12h', 8], [6, 1200000, '1d', 8],
      [7, 1400000, '1d 6h', 9], [8, 1600000, '1d 12h', 10], [9, 2100000, '1d 18h', 11],
      [10, 3000000, '2d', 12], [11, 3100000, '2d 12h', 13], [12, 3700000, '3d', 13],
      [13, 5100000, '3d 12h', 14], [14, 6500000, '4d', 15], [15, 8200000, '5d', 16],
      [16, 15000000, '7d', 17], [17, 25000000, '13d', 18],
    ],
  },
  {
    id: 'bomb-tower', name: 'Bomb Tower', category: 'defense', resource: 'gold',
    source: 'https://clashofclans.fandom.com/wiki/Bomb_Tower',
    counts: [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    rows: [
      [1, 700000, '12h', 8], [2, 1000000, '18h', 8], [3, 1300000, '1d', 9],
      [4, 1800000, '1d 12h', 10], [5, 1900000, '1d 18h', 11], [6, 2000000, '2d', 11],
      [7, 4000000, '3d', 12], [8, 5000000, '3d 12h', 13], [9, 6000000, '4d', 14],
      [10, 7000000, '4d 12h', 15], [11, 8500000, '5d', 16], [12, 14500000, '7d', 17],
      [13, 25000000, '13d', 18],
    ],
  },
  {
    id: 'army-camp', name: 'Army Camp', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Army_Camp/Home_Village',
    note: 'Level 14 added April 27, 2026 (TH18).',
    counts: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    rows: [
      [1, 200, '1m', 1], [2, 2000, '5m', 2], [3, 10000, '30m', 3], [4, 100000, '2h', 4],
      [5, 250000, '6h', 5], [6, 500000, '12h', 6], [7, 1500000, '2d', 9], [8, 2500000, '3d', 10],
      [9, 4200000, '3d 12h', 11], [10, 4500000, '4d', 12], [11, 7500000, '5d', 13],
      [12, 10000000, '6d', 15], [13, 17000000, '7d 12h', 17], [14, 26000000, '15d', 18],
    ],
  },
  {
    id: 'barracks', name: 'Barracks', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Barracks',
    note: 'Single merged building since October 2022; one per village. Wiki footnotes levels 2 to 3 as TH1 with the practical requirement of TH2.',
    counts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 100, '10s', 1], [2, 500, '15s', 1], [3, 2500, '2m', 1], [4, 5000, '30m', 2],
      [5, 20000, '2h', 3], [6, 120000, '4h', 4], [7, 270000, '6h', 5], [8, 600000, '12h', 6],
      [9, 1000000, '1d', 7], [10, 1400000, '1d 12h', 8], [11, 2600000, '2d', 9],
      [12, 3700000, '4d', 10], [13, 6000000, '5d', 11], [14, 7000000, '6d', 12],
      [15, 9000000, '7d', 13], [16, 11000000, '7d 12h', 14], [17, 12600000, '8d', 15],
      [18, 15000000, '9d', 16], [19, 26000000, '10d 12h', 17],
    ],
  },
  {
    id: 'dark-barracks', name: 'Dark Barracks', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Dark_Barracks',
    counts: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 200000, '8h', 7], [2, 600000, '1d', 7], [3, 1000000, '1d 12h', 8],
      [4, 1600000, '2d', 8], [5, 2200000, '2d 12h', 9], [6, 2900000, '3d', 9],
      [7, 4000000, '5d', 10], [8, 7000000, '6d', 11], [9, 7200000, '7d', 12],
      [10, 10000000, '7d 12h', 13], [11, 12000000, '8d', 14], [12, 20000000, '9d', 15],
      [13, 23000000, '10d', 16],
    ],
  },
  {
    id: 'laboratory', name: 'Laboratory', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Laboratory',
    note: 'Research continues while the laboratory itself upgrades. Lab level 1 at TH3 through 16 at TH18.',
    counts: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 5000, '1m', 3], [2, 25000, '30m', 4], [3, 50000, '2h', 5], [4, 100000, '4h', 6],
      [5, 200000, '8h', 7], [6, 400000, '16h', 8], [7, 800000, '1d', 9], [8, 1300000, '1d 18h', 10],
      [9, 2100000, '2d 18h', 11], [10, 3800000, '4d', 12], [11, 5500000, '6d', 13],
      [12, 8100000, '7d', 14], [13, 10800000, '8d', 15], [14, 13000000, '9d', 16],
      [15, 18000000, '10d', 17], [16, 27000000, '16d', 18],
    ],
  },
  {
    id: 'spell-factory', name: 'Spell Factory', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Spell_Factory',
    counts: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 150000, '6h', 5], [2, 300000, '12h', 6], [3, 600000, '1d', 7],
      [4, 1200000, '2d', 9], [5, 2000000, '3d', 10], [6, 3500000, '5d', 11],
      [7, 9000000, '7d', 13], [8, 14000000, '8d', 15], [9, 24000000, '9d', 16],
    ],
  },
  {
    id: 'dark-spell-factory', name: 'Dark Spell Factory', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Dark_Spell_Factory',
    counts: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 130000, '6h', 8], [2, 260000, '12h', 8], [3, 600000, '2d', 9],
      [4, 1200000, '3d', 9], [5, 2500000, '5d', 10], [6, 4000000, '6d', 12],
      [7, 11000000, '7d', 14], [8, 18000000, '10d', 15],
    ],
  },
  {
    id: 'clan-castle', name: 'Clan Castle', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Clan_Castle',
    note: 'Costs elixir since the March 2025 rebalance (was gold). Level 1 is an instant repair.',
    counts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 10000, '0s', 2], [2, 50000, '2h', 4], [3, 600000, '12h', 6],
      [4, 1200000, '1d', 8], [5, 2000000, '1d 12h', 9], [6, 3000000, '2d', 10],
      [7, 5000000, '3d', 11], [8, 5000000, '4d', 12], [9, 8000000, '6d', 13],
      [10, 10000000, '7d', 14], [11, 12000000, '8d', 15], [12, 14500000, '9d', 16],
      [13, 19000000, '10d', 17], [14, 28000000, '14d', 18],
    ],
  },
  {
    id: 'workshop', name: 'Workshop', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Workshop',
    note: 'Siege machines are upgraded with elixir in the laboratory (included in research data).',
    counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 2400000, '2d', 12], [2, 3700000, '3d', 12], [3, 5000000, '3d 12h', 12],
      [4, 8700000, '4d', 13], [5, 9000000, '5d', 13], [6, 10000000, '5d 12h', 14],
      [7, 11000000, '6d', 15], [8, 13000000, '7d', 16], [9, 26000000, '13d 12h', 17],
    ],
  },
  {
    id: 'pet-house', name: 'Pet House', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Pet_House',
    note: 'Each level unlocks a pet; pets themselves are upgraded with dark elixir (see heroes data).',
    counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    rows: [
      [1, 3000000, '1d', 14], [2, 4000000, '2d', 14], [3, 5000000, '3d', 14],
      [4, 6000000, '3d 12h', 14], [5, 7000000, '4d', 15], [6, 8000000, '4d 12h', 15],
      [7, 9000000, '5d', 15], [8, 10000000, '5d 12h', 15], [9, 11000000, '6d', 16],
      [10, 12000000, '7d', 16], [11, 16500000, '8d', 17], [12, 25500000, '13d 12h', 18],
    ],
  },
  {
    id: 'blacksmith', name: 'Blacksmith', category: 'army', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Blacksmith',
    note: 'Hero equipment upgrades use ores and are instant; only the building itself is counted here.',
    counts: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    rows: [
      [1, 600000, '12h', 8], [2, 1200000, '1d', 9], [3, 2300000, '2d', 10],
      [4, 3000000, '3d', 11], [5, 5000000, '4d', 12], [6, 6200000, '4d 12h', 13],
      [7, 9200000, '5d', 14], [8, 10000000, '6d', 15], [9, 11000000, '7d', 16],
      [10, 18000000, '10d', 17],
    ],
  },
];

export function toBuildingDef(raw: RawBuilding): BuildingDef {
  const levels: LevelRow[] = raw.rows.map(([level, cost, time, th]) => ({
    level,
    cost,
    time: parseDurationStrict(time, `${raw.id} level ${level}`),
    th,
  }));
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    resource: raw.resource,
    levels,
    countsByTH: raw.counts ?? [],
    source: raw.source,
    note: raw.note,
  };
}

export const BUILDING_DEFS: BuildingDef[] = RAW_BUILDINGS.map(toBuildingDef);

export const ARMY_BUILDINGS: BuildingDef[] = BUILDING_DEFS.filter((b) => b.category === 'army');
