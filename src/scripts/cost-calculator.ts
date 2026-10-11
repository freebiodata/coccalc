/**
 * Upgrade Cost Calculator island.
 * Mounts into [data-cost-calculator]: pick any building, hero, pet, troop or
 * spell, choose current and target level, see the total cost and time.
 * Also drives the "cost to max everything" quick block.
 */
import { BUILDINGS, HEROES, PETS, RESEARCH, MAX_TH } from '@data/game';
import { costToMaxFrom, upgradePath, DEFAULT_OPTIONS } from '@lib/calc';
import { fmtDuration, fmtNum } from '@lib/format';
import { h, option, q, clearChildren, icon, iconEl, RES_META } from './ui';

export interface CalcItem {
  id: string;
  name: string;
  group: string;
  resource: 'gold' | 'elixir' | 'dark';
  levels: { level: number; cost: number; time: number; th: number | null }[];
}

export function collectItems(): CalcItem[] {
  const items: CalcItem[] = [];
  for (const b of BUILDINGS) {
    items.push({ id: `b:${b.id}`, name: b.name, group: groupLabel(b.category), resource: b.resource, levels: b.levels });
  }
  for (const hero of HEROES) {
    items.push({ id: `h:${hero.id}`, name: hero.name, group: 'Heroes', resource: hero.resource, levels: hero.levels });
  }
  for (const pet of PETS) {
    items.push({ id: `p:${pet.id}`, name: pet.name, group: 'Pets', resource: pet.resource, levels: pet.levels });
  }
  for (const r of RESEARCH) {
    const group = r.kind === 'troop' ? 'Lab troops' : 'Lab spells';
    items.push({ id: `r:${r.id}`, name: r.name, group, resource: r.resource, levels: r.levels });
  }
  return items.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

function groupLabel(category: string): string {
  switch (category) {
    case 'defense':
      return 'Defenses';
    case 'army':
      return 'Army buildings';
    case 'resource':
      return 'Resource buildings';
    case 'trap':
      return 'Traps';
    default:
      return 'Buildings';
  }
}

export function renderCostResult(
  root: ParentNode,
  item: CalcItem,
  fromLevel: number,
  toLevel: number,
): void {
  const out = q(root, '[data-cc-result]');
  clearChildren(out);
  if (fromLevel >= toLevel) {
    out.append(h('p', { class: 'muted', text: 'Pick a target level above your current level.' }));
    return;
  }
  const path = upgradePath(item, fromLevel, toLevel);
  const meta = RES_META[item.resource] ?? RES_META.gold;
  const maxTh = Math.max(...path.rows.map((r) => r.th ?? 0));

  const res = h('div', { class: 'result card-pop' });
  const headline = h('div', { class: 'result-headline' });
  headline.append(iconEl(meta.icon, 22));
  const headlineText = h('div');
  headlineText.append(
    h('span', { class: 'sub', text: `Total cost, ${item.name} level ${fromLevel || 1} to ${toLevel}` }),
    h('span', { class: 'big-number', text: `${fmtNum(path.cost)} ${meta.label}` }),
    h('span', {
      class: 'sub',
      text: `${path.count} upgrade${path.count === 1 ? '' : 's'} across ${fmtDuration(path.timeSec)} of ${kindWord(item.id)} time${maxTh > 0 ? `, highest Town Hall needed: TH${maxTh}` : ''}.`,
    }),
  );
  headline.append(headlineText);
  res.append(headline);

  const tableWrap = h('div', { class: 'table-wrap', style: 'margin-top:14px' });
  const table = h('table');
  const thead = h('thead');
  const costHeader = h('th', { class: 'num' });
  costHeader.append(iconEl(meta.icon, 13));
  costHeader.append(document.createTextNode(` ${meta.label} cost`));
  const timeHeader = h('th');
  timeHeader.append(iconEl('hourglass', 13));
  timeHeader.append(document.createTextNode(' Time'));
  thead.append(
    h('tr', {}, h('th', { text: 'Level' }), costHeader, timeHeader, h('th', { text: 'TH needed' })),
  );
  const tbody = h('tbody');
  for (const row of path.rows) {
    tbody.append(
      h(
        'tr',
        {},
        h('td', { text: String(row.level) }),
        h('td', { class: 'num', text: fmtNum(row.cost) }),
        h('td', { text: row.time > 0 ? fmtDuration(row.time) : 'instant' }),
        h('td', { text: row.th != null ? `TH${row.th}` : 'see wiki' }),
      ),
    );
  }
  table.append(thead, tbody);
  tableWrap.append(table);
  res.append(tableWrap);
  out.append(res);
}

function kindWord(id: string): string {
  if (id.startsWith('h:')) return 'hero upgrade';
  if (id.startsWith('p:')) return 'pet upgrade';
  if (id.startsWith('r:')) return 'research';
  return 'upgrade';
}

export function mountCostCalculator(root: HTMLElement): void {
  const items = collectItems();
  const itemSelect = q<HTMLSelectElement>(root, '[data-cc-item]');
  const fromSelect = q<HTMLSelectElement>(root, '[data-cc-from]');
  const toSelect = q<HTMLSelectElement>(root, '[data-cc-to]');

  const groups = new Map<string, CalcItem[]>();
  for (const item of items) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group)!.push(item);
  }
  for (const [group, groupItems] of groups) {
    const og = document.createElement('optgroup');
    og.label = group;
    for (const item of groupItems) og.append(option(item.name, item.id));
    itemSelect.append(og);
  }

  let currentItem = items[0];

  function fillLevelSelects(): void {
    clearChildren(fromSelect);
    clearChildren(toSelect);
    const maxLevel = currentItem.levels.length > 0 ? currentItem.levels[currentItem.levels.length - 1].level : 1;
    fromSelect.append(option('Not built yet (level 0)', 0));
    for (const row of currentItem.levels) {
      if (row.level < maxLevel) fromSelect.append(option(`Level ${row.level}`, row.level));
    }
    for (const row of currentItem.levels) {
      toSelect.append(option(`Level ${row.level}`, row.level));
    }
    // Default: one level below max up to max.
    fromSelect.selectedIndex = fromSelect.options.length - 1;
    toSelect.selectedIndex = toSelect.options.length - 1;
  }

  function update(): void {
    currentItem = items.find((i) => i.id === itemSelect.value) ?? items[0];
    renderCostResult(root, currentItem, Number(fromSelect.value), Number(toSelect.value));
  }

  itemSelect.addEventListener('change', () => {
    currentItem = items.find((i) => i.id === itemSelect.value) ?? items[0];
    fillLevelSelects();
    update();
  });
  fromSelect.addEventListener('change', update);
  toSelect.addEventListener('change', update);

  fillLevelSelects();
  update();

  // Cost-to-max quick block.
  const ccmRoot = root.querySelector('[data-ccm]');
  if (ccmRoot) {
    const thSelect = q<HTMLSelectElement>(ccmRoot, '[data-ccm-th]');
    const out = q(ccmRoot, '[data-ccm-result]');
    for (let th = 1; th <= MAX_TH; th++) {
      thSelect.append(option(`TH${th}${th === MAX_TH ? ' (current max)' : ''}`, th));
    }
    if (Array.from(thSelect.options).some((o) => o.value === '9')) thSelect.value = '9';

    function renderMax(): void {
      const th = Number(thSelect.value);
      const totals = costToMaxFrom(th, DEFAULT_OPTIONS);
      clearChildren(out);
      const statBox = (resIcon: 'coin' | 'elixir' | 'dark', label: string, value: number, cls?: string) =>
        h(
          'div',
          { class: cls ? `stat-box ${cls}` : 'stat-box' },
          (() => {
            const labelRow = h('div', { class: 'label' });
            labelRow.append(iconEl(resIcon, 13));
            labelRow.append(document.createTextNode(label));
            return labelRow;
          })(),
          h('div', { class: 'value', text: fmtNum(value) }),
        );
      const res = h('div', { class: 'result' });
      res.append(
        h('span', { class: 'sub', text: `Everything remaining from arriving at TH${th} to a fully maxed TH${MAX_TH}` }),
        h(
          'div',
          { class: 'stat-row' },
          statBox('coin', 'Gold', totals.gold, 'gold'),
          statBox('elixir', 'Elixir', totals.elixir),
          statBox('dark', 'Dark elixir', totals.dark),
        ),
        h('span', { class: 'sub', text: 'Includes buildings, traps, walls, heroes, pets and lab research. Add times on the time planner.' }),
      );
      out.append(res);
    }
    thSelect.addEventListener('change', renderMax);
    renderMax();
  }
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-cost-calculator]');
  if (root) mountCostCalculator(root as HTMLElement);
}
