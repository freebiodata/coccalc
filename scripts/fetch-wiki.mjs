/**
 * Wiki data fetcher for CoCPlanner.
 *
 * Pulls wikitext for home village pages from the Fandom MediaWiki API and
 * parses per-level upgrade tables (cost via bCost cells, time via bTime
 * cells, Town Hall as the last cell) plus {{NumberAvailable|...}} counts.
 * Raw wikitext is cached in data-raw/ for auditability.
 *
 * Usage: node scripts/fetch-wiki.mjs <group>
 * Groups: defenses2, resources, traps, category
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const RAW_DIR = join(ROOT, 'data-raw');
mkdirSync(RAW_DIR, { recursive: true });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const API = 'https://clashofclans.fandom.com/api.php';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(800);
    }
  }
}

async function getWikitext(page) {
  const cache = join(RAW_DIR, page.replace(/[ /]/g, '_') + '.wiki.txt');
  if (existsSync(cache)) return readFileSync(cache, 'utf8');
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2`;
  const data = await fetchJSON(url);
  if (data.error || !data.parse) throw new Error(`API error for ${page}: ${data.error?.info}`);
  const w = data.parse.wikitext;
  writeFileSync(cache, w);
  await sleep(300);
  return w;
}

async function getLastEdited(page) {
  const url = `${API}?action=query&prop=revisions&rvprop=timestamp&titles=${encodeURIComponent(page)}&format=json&formatversion=2`;
  try {
    const data = await fetchJSON(url);
    const page0 = data.query?.pages?.[0];
    return page0?.revisions?.[0]?.timestamp ?? null;
  } catch {
    return null;
  }
}

/** Carry-forward counts from {{NumberAvailable|TH9=2|TH10=3}} to TH1..TH18. */
function parseCounts(wikitext) {
  const m = wikitext.match(/\{\{NumberAvailable([^}]*)\}\}/);
  if (!m) return null;
  const specs = [];
  const re = /TH(\d+)\s*=\s*([\d/]+)/g;
  let mm;
  while ((mm = re.exec(m[1]))) {
    // Dual values like 7/3* mean pre-merge/post-merge; keep the pre-merge value.
    specs.push([Number(mm[1]), Number(mm[2].split('/')[0])]);
  }
  if (!specs.length) return null;
  const counts = new Array(18).fill(0);
  let current = 0;
  let specIdx = 0;
  for (let th = 1; th <= 18; th++) {
    while (specIdx < specs.length && specs[specIdx][0] <= th) {
      current = specs[specIdx][1];
      specIdx++;
    }
    counts[th - 1] = current;
  }
  return counts;
}

/** Parse the main upgrade table: [{level, cost, time, th}]. */
function parseUpgradeTable(wikitext, pageName) {
  const blocks = wikitext.split('\n{|').slice(1).map((b, i) => {
    const full = '{|' + b;
    const end = full.indexOf('\n|}');
    return end === -1 ? full : full.slice(0, end);
  });

  const candidates = [];
  for (const block of blocks) {
    if (!block.includes('bCost') || !block.includes('bTime')) continue;
    const rows = block.split(/\n\|-/).slice(1);
    const parsed = [];
    for (const row of rows) {
      // Normalize: cells are separated either by newlines ("|value") or
      // inline ("||value"). Turn both into one cell list.
      const normalized = row.replace(/\n\|/g, '||');
      const rawCells = normalized.split('||').map((s) => s.trim()).filter((s) => s !== '');
      if (rawCells.length === 0) continue;
      // Cell content is everything after the last pipe of an attribute prefix.
      const cells = rawCells.map((c) => {
        const idx = c.lastIndexOf('|');
        return idx === -1 ? c : c.slice(idx + 1).trim();
      });
      const costIdx = rawCells.findIndex((c) => c.includes('bCost'));
      let timeIdx = rawCells.findIndex((c) => c.includes('bTime'));
      if (costIdx === -1) continue;
      let time;
      if (timeIdx === -1) {
        // Level 1 rows of traps have "N/A" build time without the bTime
        // class: the initial placement is instant.
        const after = cells[costIdx + 1] ?? '';
        if (!/^(N\/A|None|0s?)$/i.test(after.trim())) continue;
        timeIdx = costIdx + 1;
        time = '0s';
      } else {
        time = cells[timeIdx].replace(/<br\s*\/?>/g, ' ').trim();
      }
      const cost = Number(cells[costIdx].replace(/,/g, ''));
      const level = Number(cells[0]);
      // TH is the last cell; strip footnote markers like "1*".
      const thRaw = cells[cells.length - 1];
      const thMatch = thRaw.match(/^(\d+)/);
      const th = thMatch ? Number(thMatch[1]) : null;
      if (!Number.isFinite(level) || !Number.isFinite(cost)) continue;
      if (!/^[0-9]+[dhms]/.test(time) && !/^(N\/A|None|0s?)$/i.test(time)) continue;
      parsed.push({ level, cost, time, th });
    }
    if (parsed.length > 0) candidates.push(parsed);
  }

  // Prefer the candidate whose levels run 1..N contiguously.
  for (const c of candidates) {
    if (c[0].level === 1 && c.every((r, i) => r.level === i + 1)) return c;
  }
  if (candidates.length > 0) {
    console.warn(`  WARN ${pageName}: no contiguous 1..N table; using first candidate`);
    return candidates[0];
  }
  return null;
}

/** Extract the cost resource from the parsed table's header.
 * Header lines can also contain capacity columns ("Capacity Gold"), so only
 * lines that actually name a Cost column are classified. */
function parseCostResource(wikitext) {
  const blocks = wikitext.split('\n{|').slice(1).map((b) => {
    const full = '{|' + b;
    const end = full.indexOf('\n|}');
    return end === -1 ? full : full.slice(0, end);
  });
  for (const block of blocks) {
    if (!block.includes('bCost')) continue;
    const header = block.split(/\n\|-/)[0];
    for (const line of header.split('\n')) {
      if (!/^!/.test(line) || !/Cost/i.test(line)) continue;
      if (/Dark[ _]Elixir/i.test(line)) return 'dark';
      if (/Resources#Gold|Res\|Gold/i.test(line)) return 'gold';
      if (/Resources#Elixir|Res\|Elixir/i.test(line)) return 'elixir';
    }
  }
  return null;
}

async function processBuilding(def) {
  const pages = def.pages ?? [def.page, `${def.page}/Home Village`];
  let wikitext = null;
  let usedPage = null;
  for (const p of pages) {
    try {
      wikitext = await getWikitext(p);
      // A tabber stub transcludes the real page; detect by tiny size.
      if (wikitext.length > 3000) {
        usedPage = p;
        break;
      }
    } catch {
      /* try next */
    }
  }
  if (!wikitext) throw new Error(`no page found for ${def.id}`);

  const levels = parseUpgradeTable(wikitext, def.id);
  const counts = parseCounts(wikitext);
  const headerResource = parseCostResource(wikitext);
  const lastEdited = await getLastEdited(usedPage);
  const out = {
    id: def.id,
    name: def.name,
    category: def.category,
    resource: headerResource ?? def.resource,
    resourceFromHeader: headerResource != null,
    levels,
    countsByTH: counts,
    source: `https://clashofclans.fandom.com/wiki/${usedPage.replace(/ /g, '_')}`,
    lastEdited,
    ok: !!(levels && levels.length > 0),
  };
  writeFileSync(join(RAW_DIR, `${def.id}.json`), JSON.stringify(out, null, 1));
  const flag = out.ok ? (counts ? 'ok' : 'NO COUNTS') : 'FAILED';
  console.log(`${def.id}: ${levels ? levels.length : 0} levels, ${flag}`);
  return out;
}

const GROUPS = {
  defenses2: [
    { id: 'xbow', name: 'X-Bow', category: 'defense', resource: 'gold', page: 'X-Bow' },
    { id: 'inferno-tower', name: 'Inferno Tower', category: 'defense', resource: 'gold', page: 'Inferno Tower' },
    { id: 'eagle-artillery', name: 'Eagle Artillery', category: 'defense', resource: 'gold', page: 'Eagle Artillery' },
    { id: 'scattershot', name: 'Scattershot', category: 'defense', resource: 'gold', page: 'Scattershot' },
    { id: 'monolith', name: 'Monolith', category: 'defense', resource: 'gold', page: 'Monolith' },
    { id: 'ricochet-cannon', name: 'Ricochet Cannon', category: 'defense', resource: 'gold', page: 'Ricochet Cannon' },
    { id: 'multi-gear-tower', name: 'Multi-Gear Tower', category: 'defense', resource: 'gold', page: 'Multi-Gear Tower' },
    { id: 'multi-archer-tower', name: 'Multi-Archer Tower', category: 'defense', resource: 'gold', page: 'Multi-Archer Tower' },
    { id: 'super-wizard-tower', name: 'Super Wizard Tower', category: 'defense', resource: 'gold', page: 'Super Wizard Tower' },
  ],
  defenses3: [
    { id: 'firespitter', name: 'Firespitter', category: 'defense', resource: 'gold', page: 'Firespitter' },
    { id: 'crafting-station', name: 'Crafting Station', category: 'defense', resource: 'gold', page: 'Crafting Station' },
    { id: 'hook-tower', name: 'Hook Tower', category: 'defense', resource: 'gold', page: 'Hook Tower' },
    { id: 'longshot', name: 'Longshot', category: 'defense', resource: 'gold', page: 'Longshot' },
    { id: 'revenge-tower', name: 'Revenge Tower', category: 'defense', resource: 'gold', page: 'Revenge Tower' },
    { id: 'light-beam', name: 'Light Beam', category: 'defense', resource: 'gold', page: 'Light Beam' },
    { id: 'bomb-hive', name: 'Bomb Hive', category: 'defense', resource: 'gold', page: 'Bomb Hive' },
    { id: 'hero-bell', name: 'Hero Bell', category: 'defense', resource: 'gold', page: 'Hero Bell' },
    { id: 'logger', name: 'Logger', category: 'defense', resource: 'gold', page: 'Logger' },
    { id: 'hot-candle', name: 'Hot Candle', category: 'defense', resource: 'gold', page: 'Hot Candle' },
    { id: 'hero-hunter', name: 'Hero Hunter', category: 'defense', resource: 'gold', page: 'Hero Hunter' },
  ],
  resources: [
    { id: 'gold-mine', name: 'Gold Mine', category: 'resource', resource: 'elixir', page: 'Gold Mine' },
    { id: 'elixir-collector', name: 'Elixir Collector', category: 'resource', resource: 'elixir', page: 'Elixir Collector' },
    { id: 'gold-storage', name: 'Gold Storage', category: 'resource', resource: 'elixir', page: 'Gold Storage' },
    { id: 'elixir-storage', name: 'Elixir Storage', category: 'resource', resource: 'elixir', page: 'Elixir Storage' },
    { id: 'dark-elixir-drill', name: 'Dark Elixir Drill', category: 'resource', resource: 'gold', page: 'Dark Elixir Drill' },
    { id: 'dark-elixir-storage', name: 'Dark Elixir Storage', category: 'resource', resource: 'gold', page: 'Dark Elixir Storage' },
  ],
  traps: [
    { id: 'bomb', name: 'Bomb', category: 'trap', resource: 'gold', page: 'Bomb' },
    { id: 'spring-trap', name: 'Spring Trap', category: 'trap', resource: 'gold', page: 'Spring Trap' },
    { id: 'air-bomb', name: 'Air Bomb', category: 'trap', resource: 'gold', page: 'Air Bomb' },
    { id: 'giant-bomb', name: 'Giant Bomb', category: 'trap', resource: 'gold', page: 'Giant Bomb' },
    { id: 'seeking-air-mine', name: 'Seeking Air Mine', category: 'trap', resource: 'gold', page: 'Seeking Air Mine' },
    { id: 'skeleton-trap', name: 'Skeleton Trap', category: 'trap', resource: 'gold', page: 'Skeleton Trap' },
    { id: 'tornado-trap', name: 'Tornado Trap', category: 'trap', resource: 'gold', page: 'Tornado Trap' },
  ],
};

const group = process.argv[2];
if (group === 'category') {
  const url = `${API}?action=query&list=categorymembers&cmtitle=Category:Defensive_Buildings&cmlimit=200&format=json&formatversion=2`;
  const data = await fetchJSON(url);
  for (const m of data.query.categorymembers) console.log(m.title);
} else if (GROUPS[group]) {
  for (const def of GROUPS[group]) {
    try {
      await processBuilding(def);
    } catch (e) {
      console.error(`${def.id}: ERROR ${e.message}`);
    }
  }
} else {
  // Single page mode: node scripts/fetch-wiki.mjs page "Page Name" id category resource
  const [, , mode, page, id, category, resource] = process.argv;
  if (mode === 'page') {
    await processBuilding({ id, page, name: page, category, resource });
  } else {
    console.error('unknown group; use defenses2 | resources | traps | category | page');
    process.exit(1);
  }
}
