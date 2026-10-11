/** Shared data types for CoCPlanner datasets. */

export type ResourceKind = 'gold' | 'elixir' | 'dark';

export type BuildingCategory =
  | 'defense'
  | 'army'
  | 'resource'
  | 'trap'
  | 'other'
  | 'wall';

/** One upgradeable level of a building, hero, pet, troop or spell. */
export interface LevelRow {
  level: number;
  /** Upgrade cost, integer. */
  cost: number;
  /** Upgrade/build/research duration in seconds (0 for instant). */
  time: number;
  /** Town Hall level required for this level (null when the source only
   * lists a laboratory level). */
  th: number | null;
  /** Laboratory level required, when the source lists it (research rows). */
  labLevel?: number | null;
}

export interface BuildingDef {
  id: string;
  name: string;
  category: BuildingCategory;
  resource: ResourceKind;
  levels: LevelRow[];
  /**
   * Number of copies of this building available at each Town Hall level.
   * Index 0 = TH1, index N-1 = TH(N). Empty for buildings of which only
   * one can exist (Town Hall) or special cases (walls handled separately).
   */
  countsByTH: number[];
  source: string;
  note?: string;
}

export interface HeroDef {
  id: string;
  name: string;
  resource: ResourceKind;
  /** Town Hall level at which the hero is unlocked. */
  unlockTH: number;
  /** Levels 1..max. Level 1 is the unlock/purchase level. */
  levels: LevelRow[];
  source: string;
  note?: string;
}

export interface PetDef {
  id: string;
  name: string;
  resource: ResourceKind;
  /** Levels 1..max. Level 1 is usually free with the Pet House. */
  levels: LevelRow[];
  source: string;
  note?: string;
}

export interface ResearchDef {
  id: string;
  name: string;
  kind: 'troop' | 'spell';
  resource: ResourceKind;
  /** Research levels (level 2+; level 1 is the unlock). */
  levels: LevelRow[];
  source: string;
  note?: string;
}

export interface WallLevelRow {
  level: number;
  /** Cost per wall segment. */
  cost: number;
  /** Resources that can pay for this level, per the wiki. */
  resourceOptions: ResourceKind[];
  /** Upgrade time in seconds; 0 when wall upgrades are instant. */
  time: number;
  th: number;
}

export interface Totals {
  gold: number;
  elixir: number;
  dark: number;
}
