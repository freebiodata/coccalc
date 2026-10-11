/**
 * Time to Max Calculator island.
 * Mounts into [data-time-to-max]: pick your Town Hall and builder count and
 * see the remaining time to a fully maxed base as a calendar projection:
 * which month each Town Hall segment lands in.
 */
import { MAX_TH } from '@data/game';
import { timeToMax, DEFAULT_OPTIONS } from '@lib/calc';
import { fmtDate, fmtDuration, fmtNum } from '@lib/format';
import { h, option, q, clearChildren, iconEl } from './ui';

function monthKey(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function mountTimeToMax(root: HTMLElement, nowMs: number = Date.now()): void {
  const thSelect = q<HTMLSelectElement>(root, '[data-ttm-th]');
  const buildersSelect = q<HTMLSelectElement>(root, '[data-ttm-builders]');
  const out = q(root, '[data-ttm-result]');

  for (let th = 1; th <= MAX_TH; th++) {
    thSelect.append(option(`TH${th}`, th));
  }
  for (let b = 2; b <= 6; b++) buildersSelect.append(option(`${b} builders`, b));
  thSelect.value = '10';
  buildersSelect.value = '5';

  function update(): void {
    const th = Number(thSelect.value);
    const builders = Number(buildersSelect.value);
    const result = timeToMax(th, { ...DEFAULT_OPTIONS, builders });
    clearChildren(out);

    const finish = new Date(nowMs + result.totalSec * 1000);

    // Headline: calendar projection.
    const headline = h('div', { class: 'result card-pop' });
    const headlineRow = h('div', { class: 'result-headline' });
    headlineRow.append(iconEl('calendar', 22));
    const headlineText = h('div');
    headlineText.append(
      h('span', { class: 'sub', text: `Remaining time for a player who just reached TH${th} with a maxed TH${th - 1} base:` }),
      h('span', { class: 'big-number', text: fmtDuration(result.totalSec) }),
      h('span', { class: 'sub', text: `That is roughly ${fmtDate(finish)} with ${builders} builders, heroes and the lab running in parallel.` }),
    );
    headlineRow.append(headlineText);
    headline.append(headlineRow);

    // Department breakdown with progress bars.
    const total = Math.max(1, result.builderSec + result.heroSec + result.labSec + result.petSec);
    const bars: Array<[string, number, string, 'wrench' | 'crown' | 'flask' | 'paw']> = [
      ['Builders (all buildings and traps)', result.builderSec, 'var(--blue)', 'wrench'],
      ['Hero levels (slowest single hero)', result.heroSec, 'var(--gold-dark)', 'crown'],
      ['Laboratory research (one lab)', result.labSec, 'var(--green)', 'flask'],
    ];
    if (result.petSec > 0) bars.push(['Pet upgrades (slowest pet)', result.petSec, '#8a63d2', 'paw']);
    const dept = h('div', { class: 'card', style: 'margin-top:8px' });
    dept.append(h('h3', { text: 'Where the time goes' }));
    for (const [label, sec, color, resIcon] of bars) {
      const row = h('div', { style: 'margin-bottom:12px' });
      const labelRow = h('div', { class: 'small bar-label' });
      const labelLeft = h('span', { class: 'bar-label-text' });
      labelLeft.append(iconEl(resIcon, 14));
      labelLeft.append(document.createTextNode(label));
      const labelRight = h('span', { text: fmtDuration(sec) });
      labelRow.append(labelLeft, labelRight);
      row.append(labelRow);
      const track = h('div', { class: 'progress-track', role: 'img', 'aria-label': `${label}: ${fmtDuration(sec)}` });
      const fill = h('div', { class: 'progress-fill' });
      fill.style.width = `${Math.max(1, Math.round((sec / total) * 100))}%`;
      fill.style.background = color;
      track.append(fill);
      row.append(track);
      dept.append(row);
    }
    dept.append(h('p', { class: 'small muted', style: 'margin:0' }, 'The longest track is your real bottleneck. Everything else can finish while it runs.'));

    // Calendar projection table: one row per TH segment.
    const tableWrap = h('div', { class: 'table-wrap', style: 'margin-top:16px' });
    const table = h('table');
    const thead = h('thead');
    thead.append(h('tr', {},
      h('th', { text: 'Calendar window' }),
      h('th', { text: 'Town Hall push' }),
      h('th', { class: 'num', text: 'Months' }),
      h('th', { class: 'num', text: 'Gold' }),
      h('th', { class: 'num', text: 'Elixir' }),
      h('th', { class: 'num', text: 'Dark elixir' }),
    ));
    const tbody = h('tbody');
    let prevDate = new Date(nowMs);
    for (const step of result.steps) {
      const done = step.totals.gold + step.totals.elixir + step.totals.dark;
      if (done === 0 && step.builderSec === 0 && step.labSec === 0) continue;
      const endDate = new Date(nowMs + step.cumulativeSec * 1000);
      tbody.append(h('tr', {},
        h('td', { text: `${monthKey(prevDate)} to ${monthKey(endDate)}` }),
        h('td', { text: `TH${step.th} done` }),
        h('td', { class: 'num', text: fmtDuration(step.cumulativeSec - cumulativeBefore(result, step.th)) }),
        h('td', { class: 'num', text: fmtNum(step.totals.gold) }),
        h('td', { class: 'num', text: fmtNum(step.totals.elixir) }),
        h('td', { class: 'num', text: fmtNum(step.totals.dark) }),
      ));
      prevDate = endDate;
    }
    table.append(thead, tbody);
    tableWrap.append(table);

    const costRow = h('p', { class: 'small muted' });
    costRow.textContent = `Resources needed on the way: ${fmtNum(result.totals.gold)} gold, ${fmtNum(result.totals.elixir)} elixir and ${fmtNum(result.totals.dark)} dark elixir (walls included at gold prices).`;

    out.append(headline, dept, tableWrap, costRow);
  }

  thSelect.addEventListener('change', update);
  buildersSelect.addEventListener('change', update);
  update();
}

function cumulativeBefore(result: ReturnType<typeof timeToMax>, th: number): number {
  const idx = result.steps.findIndex((s) => s.th === th);
  if (idx <= 0) return 0;
  return result.steps[idx - 1].cumulativeSec;
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-time-to-max]');
  if (root) mountTimeToMax(root as HTMLElement);
}
