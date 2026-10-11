import type { IconName } from '../lib/icons';

export const SITE = {
  name: 'CoCPlanner',
  domain: 'coccalc.top',
  url: 'https://coccalc.top',
  tagline: 'Free Clash of Clans upgrade calculators',
  description:
    'Free Clash of Clans calculators for upgrade costs, builder time, time to max and wall costs. Runs in your browser, no sign up.',
  snapshotDate: '2026-10-11',
  contactEmail: 'hello@coccalc.top',
} as const;

export interface ToolMeta {
  slug: string;
  name: string;
  short: string;
  icon: IconName;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: '/upgrade-cost-calculator/',
    name: 'Upgrade Cost Calculator',
    short: 'Total gold, elixir or dark elixir for any building, hero or troop upgrade path.',
    icon: 'calculator',
  },
  {
    slug: '/upgrade-time-planner/',
    name: 'Upgrade Time Planner',
    short: 'Builder-aware schedule that tells you the date you will be maxed.',
    icon: 'clock',
  },
  {
    slug: '/time-to-max-calculator/',
    name: 'Time to Max Calculator',
    short: 'Remaining time to max your town hall as a month by month projection.',
    icon: 'calendar',
  },
  {
    slug: '/wall-calculator/',
    name: 'Wall Cost Calculator',
    short: 'Gold or elixir needed for any number of walls between two levels.',
    icon: 'wall',
  },
];

export const NAV_LINKS = [
  { href: '/upgrade-cost-calculator/', label: 'Cost Calculator', icon: 'calculator' },
  { href: '/upgrade-time-planner/', label: 'Time Planner', icon: 'clock' },
  { href: '/time-to-max-calculator/', label: 'Time to Max', icon: 'calendar' },
  { href: '/wall-calculator/', label: 'Walls', icon: 'wall' },
  { href: '/cost-to-max/', label: 'Cost to Max Tables', icon: 'table' },
  { href: '/guides/upgrade-priority/', label: 'Upgrade Guide', icon: 'book-open' },
] as const;

export const FOOTER_LINKS = [
  { href: '/about/', label: 'About', icon: 'users' },
  { href: '/methodology/', label: 'Data and Methods', icon: 'database' },
  { href: '/contact/', label: 'Contact', icon: 'mail' },
  { href: '/changelog/', label: 'Changelog', icon: 'file-text' },
  { href: '/privacy/', label: 'Privacy', icon: 'lock' },
  { href: '/terms/', label: 'Terms', icon: 'file-text' },
  { href: '/sitemap/', label: 'Sitemap', icon: 'map' },
] as const;
