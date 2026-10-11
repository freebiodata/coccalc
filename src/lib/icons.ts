/**
 * Inline SVG icon registry: one source of truth used by both server
 * components (Icon.astro) and the client calculator islands (ui.ts).
 * All icons are 24x24, stroke-based (currentColor, width 2, round caps),
 * so they inherit text color and weight everywhere.
 */

export const ICONS = {
  // Resources
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',
  elixir: '<path d="M12 3l5.3 5.3a7.5 7.5 0 1 1-10.6 0L12 3z"/><path d="M8.6 13.6a3.4 3.4 0 0 0 2.9 2.9"/>',
  dark: '<path d="M7 3h10l4 5.5L12 21 3 8.5 7 3z"/><path d="M3 8.5h18"/><path d="M9.4 8.5L12 21l2.6-12.5"/>',

  // Actions and UI
  check: '<path d="M20 6L9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  'chevron-right': '<path d="M9 18l6-6-6-6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4L11 13"/><path d="M19 14v5H5V5h5"/>',

  // Time
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  hourglass: '<path d="M6 3h12M6 21h12"/><path d="M8 3v3.5L12 12l4-5.5V3"/><path d="M8 21v-3.5L12 12l4 5.5V21"/>',

  // Game concepts
  wall: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 12h18M9 5v7M15 5v7M6 12v7M12 12v7M18 12v7"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18.5h.01M12 18.5h.01M15.5 18.5h.01"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8.7 11.8l2.3 2.3 4.3-4.6"/>',
  crown: '<path d="M3 8l4.5 3L12 5l4.5 6L21 8l-1.6 10H4.6L3 8z"/>',
  paw: '<circle cx="6.5" cy="9.5" r="1.7"/><circle cx="11" cy="7" r="1.7"/><circle cx="15.5" cy="7" r="1.7"/><circle cx="19" cy="10" r="1.7"/><path d="M12 11.5c-3 0-5.5 2.4-5.5 4.9 0 1.4 1.1 2.6 2.5 2.6 1.1 0 1.9-.6 3-.6s1.9.6 3 .6c1.4 0 2.5-1.2 2.5-2.6 0-2.5-2.5-4.9-5.5-4.9z"/>',
  flask: '<path d="M9.5 3h5M10 3v5.5L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 8.5V3"/><path d="M7.3 14.5h9.4"/>',
  sparkles: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/>',
  swords: '<path d="M4 4l10.5 10.5M20 4L9.5 14.5"/><path d="M4 4h3.5M4 4v3.5M20 4h-3.5M20 4v3.5"/><path d="M7.5 16.5L4 20M16.5 16.5L20 20M4 16l4 4M20 16l-4 4"/>',

  // Data and meta
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5"/><path d="M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12"/>',
  'book-open': '<path d="M12 6c-1.5-1.3-3.7-2-6-2H4v14h2c2.3 0 4.5.7 6 2 1.5-1.3 3.7-2 6-2h2V4h-2c-2.3 0-4.5.7-6 2z"/><path d="M12 6v14"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  map: '<path d="M9 4l6 2 5-2v14l-5 2-6-2-5 2V6l5-2z"/><path d="M9 4v14M15 6v14"/>',
  'file-text': '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4M12 17.2h.01"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  zap: '<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.6A5.5 5.5 0 0 1 21 20"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
  'trending-up': '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/>',
} as const;

export type IconName = keyof typeof ICONS;

export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}
