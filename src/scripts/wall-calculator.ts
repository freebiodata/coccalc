/**
 * Wall Cost Calculator island.
 * Mounts into [data-wall-calculator]: number of wall segments plus from and
 * to level, shows per-wall and total cost in gold (and the elixir option
 * for levels where the wiki says elixir works).
 */
import { WALL_LEVELS } from '@data/game';
import { wallCost } from '@lib/calc';
import { fmtNum } from '@lib/format';
import { h, option, q, clearChildren, iconEl } from './ui';

export function mountWallCalculator(root: HTMLElement): void {
  const countInput = q<HTMLInputElement>(root, '[data-wall-count]');
  const fromSelect = q<HTMLSelectElement>(root, '[data-wall-from]');
  const toSelect = q<HTMLSelectElement>(root, '[data-wall-to]');
  const out = q(root, '[data-wall-result]');

  const maxLevel = WALL_LEVELS.length > 0 ? WALL_LEVELS[WALL_LEVELS.length - 1].level : 1;
  for (const row of WALL_LEVELS) {
    if (row.level < maxLevel) fromSelect.append(option(`Level ${row.level}`, row.level));
  }
  for (const row of WALL_LEVELS) {
    toSelect.append(option(`Level ${row.level}`, row.level));
  }
  // Default to the classic 11 to 14 grind when those levels exist.
  const hasLevel = (sel: HTMLSelectElement, v: string) => Array.from(sel.options).some((o) => o.value === v);
  if (hasLevel(fromSelect, '11') && hasLevel(toSelect, '14')) {
    fromSelect.value = '11';
    toSelect.value = '14';
  } else {
    fromSelect.selectedIndex = fromSelect.options.length - 1;
    toSelect.selectedIndex = toSelect.options.length - 1;
  }

  function update(): void {
    const count = Math.max(1, Math.floor(Number(countInput.value) || 0));
    const from = Number(fromSelect.value);
    const to = Number(toSelect.value);
    clearChildren(out);

    if (to <= from) {
      out.append(h('p', { class: 'muted', text: 'Pick a target wall level above your current level.' }));
      return;
    }

    const res = wallCost(from, to, count);
    const elixirLevels = res.levels.filter((l) => l.resourceOptions.includes('elixir'));
    const allElixir = elixirLevels.length === res.levels.length;
    const someElixir = elixirLevels.length > 0 && !allElixir;
    const maxTh = Math.max(...res.levels.map((l) => l.th));

    const box = h('div', { class: 'result card-pop' });
    const headlineRow = h('div', { class: 'result-headline' });
    headlineRow.append(iconEl('coin', 22));
    const headlineText = h('div');
    headlineText.append(
      h('span', { class: 'sub', text: `${fmtNum(count)} wall segments, level ${from} to ${to}:` }),
      h('span', { class: 'big-number', text: `${fmtNum(res.total)} gold` }),
      h('span', { class: 'sub', text: `${fmtNum(res.perWall)} gold per wall across ${res.levels.length} level jumps${maxTh > 0 ? `, needs up to TH${maxTh}` : ''}.` }),
    );
    headlineRow.append(headlineText);
    box.append(headlineRow);

    const notice = (resIcon: 'check-circle' | 'info' | 'alert', text: string, cls = '') => {
      const n = h('p', { class: cls ? `notice ${cls}` : 'notice', style: 'margin:10px 0 0;display:flex;gap:8px;align-items:flex-start' });
      n.append(iconEl(resIcon, 16));
      const span = h('span');
      span.append(document.createTextNode(text));
      n.append(span);
      return n;
    };

    if (allElixir) {
      box.append(notice('check-circle', `Every level in this range can also be paid with elixir, so you can split the ${fmtNum(res.total)} between gold and elixir however you like.`));
    } else if (someElixir) {
      const eligible = elixirLevels.map((l) => l.level).join(', ');
      box.append(notice('info', `Levels ${eligible} in this range can also be paid with elixir (wiki: elixir is accepted for higher wall levels). Levels outside that list are gold only.`, 'blue'));
    } else {
      box.append(notice('alert', 'This range is gold only. Elixir becomes an option at the higher wall levels.', 'blue'));
    }

    const tableWrap = h('div', { class: 'table-wrap', style: 'margin-top:14px' });
    const table = h('table');
    const thead = h('thead');
    const perWallHeader = h('th', { class: 'num' });
    perWallHeader.append(iconEl('coin', 13));
    perWallHeader.append(document.createTextNode(' Cost per wall'));
    const totalHeader = h('th', { class: 'num' });
    totalHeader.append(iconEl('grid', 13));
    totalHeader.append(document.createTextNode(` Total for ${fmtNum(count)}`));
    thead.append(h('tr', {},
      h('th', { text: 'Wall level' }),
      perWallHeader,
      totalHeader,
      h('th', { text: 'Can pay with' }),
      h('th', { text: 'TH needed' }),
    ));
    const tbody = h('tbody');
    for (const l of res.levels) {
      const resources = l.resourceOptions.join(' or ');
      tbody.append(h('tr', {},
        h('td', { text: String(l.level) }),
        h('td', { class: 'num', text: fmtNum(l.cost) }),
        h('td', { class: 'num', text: fmtNum(l.cost * count) }),
        h('td', { text: resources }),
        h('td', { text: `TH${l.th}` }),
      ));
    }
    table.append(thead, tbody);
    tableWrap.append(table);
    out.append(box, tableWrap);
  }

  countInput.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  toSelect.addEventListener('change', update);
  update();
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-wall-calculator]');
  if (root) mountWallCalculator(root as HTMLElement);
}
