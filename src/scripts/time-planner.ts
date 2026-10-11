/**
 * Upgrade Time Planner island.
 * Mounts into [data-time-planner]: pick your Town Hall and builder count,
 * get the realistic finish date plus a per-TH schedule and the longest
 * upgrades to start first.
 */
import { HEROES, MAX_TH } from '@data/game';
import { segmentBreakdown, timeToMax, DEFAULT_OPTIONS, type ProjectionOptions } from '@lib/calc';
import { fmtDate, fmtDuration, fmtNum } from '@lib/format';
import { h, option, q, clearChildren, iconEl } from './ui';

export function mountTimePlanner(root: HTMLElement, nowMs: number = Date.now()): void {
  const thSelect = q<HTMLSelectElement>(root, '[data-tp-th]');
  const buildersSelect = q<HTMLSelectElement>(root, '[data-tp-builders]');
  const includeLab = q<HTMLInputElement>(root, '[data-tp-lab]');
  const includeHeroes = q<HTMLInputElement>(root, '[data-tp-heroes]');
  const includePets = q<HTMLInputElement>(root, '[data-tp-pets]');
  const out = q(root, '[data-tp-result]');

  for (let th = 1; th <= MAX_TH; th++) {
    thSelect.append(option(`TH${th}${th === MAX_TH ? ' (max)' : ''}`, th));
  }
  for (let b = 2; b <= 6; b++) buildersSelect.append(option(`${b} builders`, b));
  thSelect.value = '11';
  buildersSelect.value = '5';

  function opts(): ProjectionOptions {
    return {
      ...DEFAULT_OPTIONS,
      includeLab: includeLab.checked,
      includeHeroes: includeHeroes.checked,
      includePets: includePets.checked,
      builders: Number(buildersSelect.value),
    };
  }

  function update(): void {
    const th = Number(thSelect.value);
    const builders = Number(buildersSelect.value);
    const result = timeToMax(th, opts());
    clearChildren(out);

    if (th >= MAX_TH) {
      out.append(h('p', { class: 'muted', text: `TH${MAX_TH} is the highest Town Hall in our data. You are already at the top. Heroes, pets and lab may still have levels left.` }));
    }

    const finish = new Date(nowMs + result.totalSec * 1000);
    const heroName = result.heroId
      ? (HEROES.find((hero) => hero.id === result.heroId)?.name ?? 'heroes')
      : 'heroes';

    const headline = h('div', { class: 'result card-pop' });
    const headlineRow = h('div', { class: 'result-headline' });
    headlineRow.append(iconEl('calendar', 22));
    const headlineText = h('div');
    headlineText.append(
      h('span', { class: 'sub', text: `From a fresh TH${th} (maxed TH${th - 1}) to fully maxed TH${MAX_TH}, with ${builders} builders:` }),
      h('span', { class: 'big-number', text: `Maxed around ${fmtDate(finish)}` }),
      h('span', { class: 'sub', text: `That is about ${fmtDuration(result.totalSec)} on the critical path (${criticalLabel(result.criticalPath, heroName)}).` }),
    );
    headlineRow.append(headlineText);
    headline.append(headlineRow);

    const statBox = (resIcon: 'wrench' | 'layers' | 'flask' | 'crown', label: string, value: string) => {
      const labelRow = h('div', { class: 'label' });
      labelRow.append(iconEl(resIcon, 13));
      labelRow.append(document.createTextNode(label));
      return h('div', { class: 'stat-box' }, labelRow, h('div', { class: 'value', text: value }));
    };
    const stats = h(
      'div',
      { class: 'stat-row' },
      statBox('wrench', 'Builder time (TH order)', fmtDuration(result.builderSec)),
      statBox('layers', 'Sum of all upgrades', fmtDuration(result.builderWorkSec)),
      statBox('flask', 'Lab research', fmtDuration(result.labSec)),
      statBox('crown', 'Slowest hero track', fmtDuration(result.heroSec)),
    );

    // Per-TH schedule table.
    const tableWrap = h('div', { class: 'table-wrap', style: 'margin-top:8px' });
    const table = h('table');
    const thead = h('thead');
    thead.append(h('tr', {},
      h('th', { text: 'Segment' }),
      h('th', { class: 'num', text: 'Builder time' }),
      h('th', { class: 'num', text: 'Gold' }),
      h('th', { class: 'num', text: 'Elixir' }),
      h('th', { class: 'num', text: 'Dark' }),
      h('th', { text: 'Done by' }),
    ));
    const tbody = h('tbody');
    for (const step of result.steps) {
      const end = new Date(nowMs + step.cumulativeSec * 1000);
      const done = step.totals.gold + step.totals.elixir + step.totals.dark;
      if (done === 0 && step.builderSec === 0 && step.labSec === 0) continue;
      tbody.append(h('tr', {},
        h('td', { text: `TH${step.th}` }),
        h('td', { class: 'num', text: step.builderSec > 0 ? fmtDuration(step.builderSec) : '-' }),
        h('td', { class: 'num', text: fmtNum(step.totals.gold) }),
        h('td', { class: 'num', text: fmtNum(step.totals.elixir) }),
        h('td', { class: 'num', text: fmtNum(step.totals.dark) }),
        h('td', { text: fmtDate(end) }),
      ));
    }
    table.append(thead, tbody);
    tableWrap.append(table);

    // Longest upgrades first, for the current TH segment.
    const seg = segmentBreakdown(th, opts());
    const longest = [...seg.namedJobs].sort((a, b) => b.timeSec - a.timeSec).slice(0, 8).filter((j) => j.timeSec > 0);
    let longestBlock: HTMLElement | null = null;
    if (longest.length > 0) {
      longestBlock = h('div', { class: 'card', style: 'margin-top:16px' });
      const longestHead = h('h3', { class: 'with-icon' });
      longestHead.append(iconEl('zap', 18));
      longestHead.append(document.createTextNode(` Start these first at TH${th}`));
      longestBlock.append(
        longestHead,
        h('p', { class: 'small muted', text: 'The longest upgrades of this Town Hall segment. Starting long jobs early is exactly what the greedy schedule assumes.' }),
      );
      const list = h('ol', { class: 'small', style: 'padding-left:20px;margin:0' });
      for (const job of longest) {
        list.append(h('li', {}, `${job.name} to level ${job.level}: ${fmtDuration(job.timeSec)}, ${fmtNum(job.cost)} ${job.resource === 'dark' ? 'dark elixir' : job.resource === 'elixir' ? 'elixir' : 'gold'}`));
      }
      longestBlock.append(list);
    }

    out.append(headline, stats, tableWrap);
    if (longestBlock) out.append(longestBlock);

    const note = h('p', { class: 'small muted', style: 'margin-top:14px' });
    note.textContent =
      'Assumptions: builders work in Town Hall order and never sit idle (longest-first greedy schedule), heroes, pets and lab run in parallel with builders and each other, wall upgrades are instant, and no builder boost, research potion, Gold Pass or event reduction is applied. Real dates depend on how you play.';
    out.append(note);
  }

  thSelect.addEventListener('change', update);
  buildersSelect.addEventListener('change', update);
  includeLab.addEventListener('change', update);
  includeHeroes.addEventListener('change', update);
  includePets.addEventListener('change', update);
  update();
}

function criticalLabel(path: 'builders' | 'heroes' | 'pets' | 'lab', heroName: string): string {
  switch (path) {
    case 'builders':
      return 'builders are the bottleneck';
    case 'heroes':
      return `${heroName} levels are the bottleneck`;
    case 'pets':
      return 'pet upgrades are the bottleneck';
    case 'lab':
      return 'laboratory research is the bottleneck';
  }
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-time-planner]');
  if (root) mountTimePlanner(root as HTMLElement);
}
