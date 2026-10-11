# Data sources and provenance

Every value on CoCPlanner comes from the Clash of Clans Wiki on Fandom
(https://clashofclans.fandom.com), snapshot taken **2026-10-11**.

## How the data was collected

Two pipelines were used, and they were cross-validated against each other:

1. **Wiki extraction agents** fetched page wikitext through the Fandom MediaWiki
   API (`action=parse&prop=wikitext`) and transcribed the upgrade tables.
   Used for: army buildings, group 1 defenses, all troops and spells.
2. **A scripted fetcher** (`scripts/fetch-wiki.mjs`) parsed the same wikitext
   programmatically (cost via `bCost` cells, build time via `bTime` cells,
   Town Hall requirement as the last column, counts via `{{NumberAvailable|...}}`
   templates, cost resource from each table's header line).
   Used for: group 2 and 3 defenses, resources, traps, Town Hall, Walls,
   Hero Hall, heroes and pets.

Cross-validation: the Pet House was extracted by both pipelines and matched
level for level (costs, times, Town Halls). Raw wikitext snapshots for every
scripted page are cached under `data-raw/` for audit.

## Coverage (home village only, TH1 to TH18)

| Dataset | Count | Details |
|---|---|---|
| Buildings and traps | 44 | All defenses, army buildings, resource buildings, traps, Town Hall, Hero Hall |
| Walls | 19 levels | Per-segment cost, gold/elixir options, counts 25 to 325 by TH |
| Heroes | 4 | Barbarian King, Archer Queen, Grand Warden, Royal Champion, every level |
| Pets | 12 | All pets through Greedy Raven (Pet House 12) |
| Lab research | 49 entries | 31 troops and 18 spells, every research level |

## Per-group sources

Each entry in `src/data/*.ts` carries its `source` URL. Group summaries:

- **Defenses group 1** (Cannon, Archer Tower, Mortar, Air Defense, Wizard Tower,
  Air Sweeper, Hidden Tesla, Bomb Tower): wiki pages, e.g.
  https://clashofclans.fandom.com/wiki/Cannon
- **Defenses group 2** (X-Bow, Inferno Tower, Eagle Artillery, Scattershot,
  Monolith, Ricochet Cannon, Multi-Gear Tower, Multi-Archer Tower,
  Super Wizard Tower, Firespitter, Revenge Tower): e.g.
  https://clashofclans.fandom.com/wiki/X-Bow/Home_Village
- **Army buildings** (Army Camp, Barracks, Dark Barracks, Laboratory, Spell
  Factory, Dark Spell Factory, Clan Castle, Workshop, Pet House, Blacksmith):
  e.g. https://clashofclans.fandom.com/wiki/Army_Camp/Home_Village
- **Resources and traps**: e.g.
  https://clashofclans.fandom.com/wiki/Gold_Mine ,
  https://clashofclans.fandom.com/wiki/Bomb
- **Town Hall**: https://clashofclans.fandom.com/wiki/Town_Hall
- **Walls**: https://clashofclans.fandom.com/wiki/Wall/Home_Village
- **Heroes**: e.g. https://clashofclans.fandom.com/wiki/Barbarian_King
- **Pets**: e.g. https://clashofclans.fandom.com/wiki/Unicorn
- **Troops and spells**: each unit page, e.g.
  https://clashofclans.fandom.com/wiki/Archer ,
  https://clashofclans.fandom.com/wiki/Poison_Spell

## Derivations

- **Research Town Hall gating:** the wiki gates research by laboratory level.
  Laboratory level 1 unlocks at TH3 through laboratory level 16 at TH18, so
  research TH = lab level + 2.
- **Hero Town Hall gating (2026 Hero Hall system):** Archer Queen, Grand Warden
  and Royal Champion tables list "Hero Hall Level Required". Hero Hall levels
  map 1:1 to TH4, TH8, TH9 ... TH18 (from the Hero Hall building table), and
  that mapping is applied to hero levels. The Barbarian King table lists Town
  Hall requirements directly.
- **Pet Town Hall gating:** pet tables list Pet House level; Pet House levels
  map to TH14 (levels 1 to 4), TH15 (5 to 8), TH16 (9 to 10), TH17 (11),
  TH18 (12).
- **Building counts by TH:** carried forward from each page's
  `{{NumberAvailable}}` template (a count applies until the next change).

## Uncertainty flags

Values below are exactly what the wiki shows, but they are unusual enough that
we flag them here:

1. **Eagle Artillery count is 0 at TH17/TH18.** The wiki's NumberAvailable
   template explicitly sets `TH17=0`. Kept verbatim.
2. **Merge-defense dual counts.** For Cannon, Archer Tower and Wizard Tower the
   wiki lists two TH17/TH18 counts (pre-merge and post-merge into Ricochet
   Cannon, Multi-Archer Tower, Super Wizard Tower). We use the pre-merge value
   and count the merged defenses as their own buildings.
3. **Revenge Tower** costs **dark elixir** per its cost header (430,000 and
   460,000), and its level 1 build time is listed as "13d 5s" on the wiki;
   both kept verbatim.
4. **Monolith** costs dark elixir (200,000 to 470,000), the first defense to
   do so.
5. **Resource changes from rebalances.** The wiki shows Dark Elixir Drill,
   Dark Elixir Storage and Clan Castle upgrades now costing elixir (the Clan
   Castle changed from gold to elixir in March 2025). We follow the wiki.
6. **Barracks levels 2 and 3** are listed as TH1 with a footnote that they
   practically require TH2. Kept as TH1 with a note in the data.
7. **Hero level 1** is the unlock level and has no upgrade cost in the tables
   (the Grand Warden's level 1 purchase of 1,000,000 elixir is an exception
   that is included).
8. **Wall costs** are the gold column; elixir is accepted from wall level 5 up
   at the same price, and the wall calculator marks those levels.
9. **Last-edited dates** per page were captured where available; several pages
   transclude data from templates, so a stale page date can still carry current
   table data. The snapshot date is authoritative.

## Deliberately excluded

- **Builder Base and Clan Capital** (separate progression systems).
- **Crafted Defenses and the Crafting Station** (temporary, phase-based
  content from 2026; the station itself is free).
- **Guardians** (Longshot, Logger and friends, a TH17+ defender system) and
  guardian posts: may be added once their upgrade tables stabilize.
- **Hero equipment** at the Blacksmith (paid with ores, not gold/elixir/dark
  elixir; the Blacksmith building itself is included).
- **Builder's Huts** (gem purchases).
- Discounts of any kind (Gold Pass, events, books, potions, wall rings).

## Updating the data

1. Delete the relevant `data-raw/*.wiki.txt` cache files.
2. Run `node scripts/fetch-wiki.mjs <group>` (or `page` mode), inspect the JSON.
3. Run `node scripts/compile-data.mjs` to regenerate the TS data modules.
4. `npm run test` (integrity and spot checks), then update the snapshot date
   in `src/data/game.ts`, `src/data/meta.ts` and the changelog.
