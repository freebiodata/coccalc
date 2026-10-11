/**
 * Master game data module for CoCPlanner.
 * Composes every dataset; every value is compiled from the Clash of Clans
 * Wiki (https://clashofclans.fandom.com), snapshot 2026-10-11.
 * See docs/data-sources.md for per-table sources and uncertainty flags.
 */
import { BUILDING_DEFS, toBuildingDef } from './buildings';
import { RAW_FETCHED } from './buildings-fetched';
import { HEROES } from './heroes';
import { PETS } from './pets';
import { RESEARCH } from './research';
import { WALL_COUNTS_BY_TH, WALL_LEVELS } from './walls';

export const DATA_SNAPSHOT_DATE = '2026-10-11';

/** Current maximum Town Hall in the game per the wiki (October 2026). */
export const MAX_TH = 18;

export const BUILDINGS = [...BUILDING_DEFS, ...RAW_FETCHED.map(toBuildingDef)];

export { HEROES, PETS, RESEARCH, WALL_COUNTS_BY_TH, WALL_LEVELS };

/** True when every research row could be tied to a Town Hall level. */
export const RESEARCH_TH_COMPLETE = RESEARCH.every((r) => r.levels.every((l) => l.th != null));

/** True when every pet upgrade row has a Town Hall requirement. */
export const PETS_TH_COMPLETE = PETS.every((p) => p.levels.every((l) => l.th != null));
