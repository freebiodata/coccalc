/** Tiny DOM helpers shared by the calculator islands (no framework). */
import { ICONS, type IconName } from '../lib/icons';

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | null | undefined> = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = String(value);
    else if (key === 'text') el.textContent = String(value);
    else el.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child == null) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

export function option(label: string, value: string | number): HTMLOptionElement {
  const opt = document.createElement('option');
  opt.value = String(value);
  opt.textContent = label;
  return opt;
}

/**
 * Inline SVG markup for a registry icon. Only ever fed from the static
 * ICONS registry, so the innerHTML use sites stay safe.
 */
export function icon(name: IconName, size = 18): string {
  return `<svg class="icon icon-${name}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

/** Same icon as a ready-to-append span element. */
export function iconEl(name: IconName, size = 16): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'icon-slot';
  span.innerHTML = icon(name, size);
  return span;
}

export function clearChildren(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function q<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element ${selector}`);
  return found;
}

export const RES_META: Record<string, { label: string; icon: IconName }> = {
  gold: { label: 'Gold', icon: 'coin' },
  elixir: { label: 'Elixir', icon: 'elixir' },
  dark: { label: 'Dark Elixir', icon: 'dark' },
};
