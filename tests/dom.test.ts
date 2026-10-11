import { beforeEach, describe, expect, it } from 'vitest';
import { mountCostCalculator, collectItems } from '@scripts/cost-calculator';
import { mountTimePlanner } from '@scripts/time-planner';
import { mountTimeToMax } from '@scripts/time-to-max';
import { mountWallCalculator } from '@scripts/wall-calculator';

function buildRoot(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.append(el);
  return el;
}

function change(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event('change'));
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('wall calculator island', () => {
  const rootHtml = `
    <div data-wall-calculator>
      <input data-wall-count type="number" value="100" />
      <select data-wall-from></select>
      <select data-wall-to></select>
      <div data-wall-result></div>
    </div>`;

  it('fills level selects and prices the default range', () => {
    const root = buildRoot(rootHtml);
    mountWallCalculator(root as HTMLElement);
    const from = root.querySelector('[data-wall-from]') as HTMLSelectElement;
    const to = root.querySelector('[data-wall-to]') as HTMLSelectElement;
    expect(from.options.length).toBe(18); // levels 1..18 (19 minus the max)
    expect(to.options.length).toBe(19);
    const result = root.querySelector('[data-wall-result]')!.textContent!;
    expect(result).toContain('gold');
    expect(result).toContain('100 wall segments');
  });

  it('updates the total when the count changes', () => {
    const root = buildRoot(rootHtml);
    mountWallCalculator(root as HTMLElement);
    const count = root.querySelector('[data-wall-count]') as HTMLInputElement;
    const resultBefore = root.querySelector('[data-wall-result]')!.textContent!;
    count.value = '325';
    count.dispatchEvent(new Event('input'));
    const resultAfter = root.querySelector('[data-wall-result]')!.textContent!;
    expect(resultAfter).not.toBe(resultBefore);
    expect(resultAfter).toContain('325 wall segments');
  });

  it('marks elixir-eligible levels', () => {
    const root = buildRoot(rootHtml);
    mountWallCalculator(root as HTMLElement);
    change(root.querySelector('[data-wall-from]') as HTMLSelectElement, '10');
    change(root.querySelector('[data-wall-to]') as HTMLSelectElement, '12');
    const result = root.querySelector('[data-wall-result]')!.textContent!;
    expect(result).toContain('elixir');
  });
});

describe('upgrade cost calculator island', () => {
  const rootHtml = `
    <div data-cost-calculator>
      <select data-cc-item></select>
      <select data-cc-from></select>
      <select data-cc-to></select>
      <div data-cc-result></div>
      <div data-ccm>
        <select data-ccm-th></select>
        <div data-ccm-result></div>
      </div>
    </div>`;

  it('collects buildings, heroes, pets and research into groups', () => {
    const items = collectItems();
    expect(items.length).toBeGreaterThan(90);
    const groups = new Set(items.map((i) => i.group));
    expect(groups.has('Defenses')).toBe(true);
    expect(groups.has('Heroes')).toBe(true);
    expect(groups.has('Lab troops')).toBe(true);
    expect(groups.has('Lab spells')).toBe(true);
  });

  it('renders a result table and updates on selection', () => {
    const root = buildRoot(rootHtml);
    mountCostCalculator(root as HTMLElement);
    const item = root.querySelector('[data-cc-item]') as HTMLSelectElement;
    const from = root.querySelector('[data-cc-from]') as HTMLSelectElement;
    const to = root.querySelector('[data-cc-to]') as HTMLSelectElement;

    change(item, 'b:cannon');
    change(from, '0');
    change(to, '3');
    const result = root.querySelector('[data-cc-result]')!.textContent!;
    // Cannon 1..3 costs 250 + 1,000 + 4,000.
    expect(result).toContain('5,250');
    expect(result).toContain('Gold');
  });

  it('renders the cost to max block', () => {
    const root = buildRoot(rootHtml);
    mountCostCalculator(root as HTMLElement);
    const th = root.querySelector('[data-ccm-th]') as HTMLSelectElement;
    expect(th.options.length).toBe(18);
    const result = root.querySelector('[data-ccm-result]')!.textContent!;
    expect(result).toContain('Gold');
    expect(result).toContain('Elixir');
    expect(result).toContain('Dark elixir');
  });
});

describe('time planner island', () => {
  const rootHtml = `
    <div data-time-planner>
      <select data-tp-th></select>
      <select data-tp-builders></select>
      <input type="checkbox" data-tp-lab checked />
      <input type="checkbox" data-tp-heroes checked />
      <input type="checkbox" data-tp-pets checked />
      <div data-tp-result></div>
    </div>`;

  it('shows a finish date and a per-TH schedule', () => {
    const root = buildRoot(rootHtml);
    mountTimePlanner(root as HTMLElement, Date.UTC(2026, 9, 11));
    const result = root.querySelector('[data-tp-result]')!;
    expect(result.textContent).toContain('Maxed around');
    expect(result.textContent).toContain('critical path');
    expect(result.querySelectorAll('table tr').length).toBeGreaterThan(5);
  });

  it('reacts to the builder count', () => {
    const root = buildRoot(rootHtml);
    mountTimePlanner(root as HTMLElement, Date.UTC(2026, 9, 11));
    const before = root.querySelector('[data-tp-result]')!.textContent!;
    change(root.querySelector('[data-tp-builders]') as HTMLSelectElement, '2');
    const after = root.querySelector('[data-tp-result]')!.textContent!;
    expect(after).not.toBe(before);
  });
});

describe('time to max island', () => {
  const rootHtml = `
    <div data-time-to-max>
      <select data-ttm-th></select>
      <select data-ttm-builders></select>
      <div data-ttm-result></div>
    </div>`;

  it('shows the calendar projection and department bars', () => {
    const root = buildRoot(rootHtml);
    mountTimeToMax(root as HTMLElement, Date.UTC(2026, 9, 11));
    const result = root.querySelector('[data-ttm-result]')!;
    const text = result.textContent!;
    expect(text).toContain('Remaining time');
    expect(text).toContain('Where the time goes');
    expect(text).toContain('Laboratory research');
    expect(result.querySelectorAll('.progress-track').length).toBeGreaterThanOrEqual(3);
  });

  it('changes projection when the Town Hall changes', () => {
    const root = buildRoot(rootHtml);
    mountTimeToMax(root as HTMLElement, Date.UTC(2026, 9, 11));
    const before = root.querySelector('[data-ttm-result]')!.textContent!;
    change(root.querySelector('[data-ttm-th]') as HTMLSelectElement, '15');
    const after = root.querySelector('[data-ttm-result]')!.textContent!;
    expect(after).not.toBe(before);
  });
});
