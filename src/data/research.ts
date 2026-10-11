/**
 * Laboratory research data: home village troops and spells.
 * Source: Clash of Clans Wiki (clashofclans.fandom.com), snapshot 2026-10-11.
 * Rows are [level, cost, timeAsString, laboratoryLevelRequired].
 * The wiki gates research by laboratory level, not Town Hall; Town Hall is
 * derived as labLevel + 2 because the Laboratory building table maps
 * laboratory level 1 to TH3 through laboratory level 16 to TH18.
 * Durations are parsed at module load and throw on unparsable values.
 */
import { parseDurationStrict } from '../lib/parse';
import type { LevelRow, ResearchDef } from './types';

type Row = [number, number, string, number];

interface Raw {
  id: string;
  name: string;
  kind: 'troop' | 'spell';
  resource: 'elixir' | 'dark';
  rows: Row[];
  source: string;
}

const RAW: Raw[] = [
  // ---- Elixir troops ----
  {
    id: 'barbarian', name: 'Barbarian', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Barbarian/Home_Village',
    rows: [[2, 10000, '30m', 1], [3, 50000, '1h', 3], [4, 130000, '2h', 5], [5, 300000, '4h', 6], [6, 800000, '8h', 7], [7, 1000000, '12h', 8], [8, 1500000, '1d', 9], [9, 2500000, '1d 12h', 10], [10, 4300000, '2d', 12], [11, 6000000, '3d', 13], [12, 8000000, '4d', 14], [13, 24000000, '12d 12h', 16]],
  },
  {
    id: 'archer', name: 'Archer', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Archer',
    rows: [[2, 20000, '1h', 1], [3, 80000, '2h', 3], [4, 200000, '3h', 5], [5, 500000, '8h', 6], [6, 1000000, '12h', 7], [7, 1500000, '1d', 8], [8, 2300000, '1d 12h', 9], [9, 3000000, '2d', 10], [10, 4500000, '3d', 12], [11, 6500000, '4d', 13], [12, 9000000, '4d 12h', 14], [13, 14000000, '9d', 15], [14, 25000000, '13d 12h', 16]],
  },
  {
    id: 'giant', name: 'Giant', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Giant',
    rows: [[2, 40000, '2h', 2], [3, 150000, '4h', 4], [4, 400000, '6h', 5], [5, 800000, '12h', 6], [6, 1500000, '1d', 7], [7, 2300000, '1d 12h', 8], [8, 2600000, '2d', 9], [9, 3400000, '2d 6h', 10], [10, 5000000, '3d', 11], [11, 7500000, '4d', 13], [12, 10000000, '5d', 14], [13, 15000000, '9d 12h', 15], [14, 25000000, '13d 12h', 16]],
  },
  {
    id: 'goblin', name: 'Goblin', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Goblin',
    rows: [[2, 45000, '2h', 1], [3, 100000, '3h', 3], [4, 500000, '6h', 5], [5, 700000, '12h', 6], [6, 1600000, '1d', 7], [7, 2200000, '1d 12h', 8], [8, 3700000, '2d 6h', 10], [9, 8000000, '5d', 13], [10, 26000000, '14d', 16]],
  },
  {
    id: 'wall-breaker', name: 'Wall Breaker', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Wall_Breaker',
    rows: [[2, 80000, '3h', 2], [3, 200000, '4h', 4], [4, 450000, '12h', 5], [5, 1000000, '16h', 6], [6, 2400000, '1d', 8], [7, 2800000, '1d 12h', 9], [8, 3800000, '2d 12h', 10], [9, 5200000, '3d', 11], [10, 6500000, '5d', 12], [11, 9500000, '5d 12h', 13], [12, 11000000, '6d', 14], [13, 15500000, '10d', 15], [14, 26000000, '14d', 16]],
  },
  {
    id: 'balloon', name: 'Balloon', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Balloon',
    rows: [[2, 100000, '4h', 2], [3, 400000, '6h', 4], [4, 720000, '18h', 5], [5, 1300000, '1d', 6], [6, 2750000, '3d', 7], [7, 4400000, '3d 6h', 9], [8, 5000000, '3d 12h', 10], [9, 7000000, '4d 12h', 11], [10, 10000000, '7d', 12], [11, 14000000, '8d 12h', 14], [12, 17500000, '11d', 15], [13, 28000000, '14d 18h', 16]],
  },
  {
    id: 'wizard', name: 'Wizard', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Wizard',
    rows: [[2, 120000, '4h', 3], [3, 300000, '5h', 4], [4, 600000, '12h', 5], [5, 1200000, '18h', 6], [6, 2000000, '1d 12h', 7], [7, 2500000, '2d', 8], [8, 3100000, '2d 6h', 9], [9, 4000000, '2d 12h', 10], [10, 5500000, '3d 12h', 11], [11, 10000000, '5d 12h', 13], [12, 11500000, '7d', 14], [13, 16000000, '10d 12h', 15], [14, 27000000, '14d', 16]],
  },
  {
    id: 'healer', name: 'Healer', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Healer',
    rows: [[2, 450000, '12h', 5], [3, 900000, '1d', 6], [4, 2500000, '2d', 7], [5, 4000000, '3d', 9], [6, 6000000, '4d 12h', 11], [7, 9500000, '6d 12h', 12], [8, 11000000, '7d', 13], [9, 13000000, '7d 6h', 14], [10, 17000000, '11d', 15], [11, 28500000, '15d', 16]],
  },
  {
    id: 'dragon', name: 'Dragon', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Dragon',
    rows: [[2, 1000000, '18h', 5], [3, 2000000, '1d 12h', 6], [4, 3000000, '2d', 7], [5, 3800000, '3d', 8], [6, 4900000, '4d', 9], [7, 5000000, '4d 12h', 10], [8, 7500000, '5d', 11], [9, 10500000, '7d', 12], [10, 12000000, '7d 12h', 13], [11, 14000000, '8d 12h', 14], [12, 18500000, '10d', 15], [13, 28500000, '15d', 16]],
  },
  {
    id: 'pekka', name: 'P.E.K.K.A', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/P.E.K.K.A',
    rows: [[2, 600000, '12h', 6], [3, 1300000, '18h', 6], [4, 2000000, '1d', 7], [5, 2100000, '1d 12h', 8], [6, 2500000, '2d', 8], [7, 4500000, '3d', 9], [8, 5000000, '3d 12h', 10], [9, 5800000, '4d', 11], [10, 10500000, '5d 12h', 13], [11, 12000000, '7d', 14], [12, 16000000, '10d', 15], [13, 28000000, '14d 12h', 16]],
  },
  {
    id: 'baby-dragon', name: 'Baby Dragon', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Baby_Dragon/Home_Village',
    rows: [[2, 1500000, '1d', 7], [3, 2000000, '1d 12h', 8], [4, 2800000, '2d', 8], [5, 3700000, '2d 18h', 9], [6, 4800000, '3d', 10], [7, 6200000, '4d', 11], [8, 9500000, '6d', 12], [9, 11000000, '7d', 13], [10, 13500000, '7d 6h', 14], [11, 16500000, '10d', 15], [12, 29000000, '15d 6h', 16]],
  },
  {
    id: 'miner', name: 'Miner', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Miner',
    rows: [[2, 1500000, '1d', 8], [3, 2600000, '2d', 8], [4, 3000000, '2d 6h', 9], [5, 4000000, '2d 12h', 9], [6, 4800000, '3d', 10], [7, 6000000, '4d', 11], [8, 8600000, '6d', 12], [9, 10500000, '6d 12h', 13], [10, 12500000, '7d', 14], [11, 16500000, '9d 12h', 15], [12, 28000000, '14d 12h', 16]],
  },
  {
    id: 'electro-dragon', name: 'Electro Dragon', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Electro_Dragon',
    rows: [[2, 6000000, '4d', 9], [3, 7000000, '4d 12h', 10], [4, 9000000, '7d', 11], [5, 11000000, '8d', 12], [6, 14000000, '8d 12h', 13], [7, 16000000, '9d', 14], [8, 20000000, '10d', 15], [9, 30000000, '16d', 16]],
  },
  {
    id: 'yeti', name: 'Yeti', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Yeti',
    rows: [[2, 5000000, '3d', 10], [3, 6500000, '4d 12h', 11], [4, 10000000, '7d', 12], [5, 12000000, '7d 12h', 13], [6, 14500000, '8d 6h', 14], [7, 17000000, '10d', 15], [8, 27500000, '15d 12h', 16]],
  },
  {
    id: 'dragon-rider', name: 'Dragon Rider', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Dragon_Rider',
    rows: [[2, 7500000, '6d', 11], [3, 12000000, '8d', 12], [4, 14500000, '9d', 14], [5, 19000000, '10d 6h', 15], [6, 29500000, '15d 12h', 16]],
  },
  {
    id: 'electro-titan', name: 'Electro Titan', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Electro_Titan',
    rows: [[2, 14000000, '8d', 12], [3, 16000000, '9d', 13], [4, 18500000, '11d', 14], [5, 30000000, '16d', 16]],
  },
  {
    id: 'root-rider', name: 'Root Rider', kind: 'troop', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Root_Rider',
    rows: [[2, 15000000, '8d', 13], [3, 17600000, '10d', 14], [4, 30000000, '16d', 16]],
  },
  // ---- Dark troops ----
  {
    id: 'minion', name: 'Minion', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Minion',
    rows: [[2, 1000, '6h', 5], [3, 2500, '8h', 6], [4, 5000, '12h', 6], [5, 10000, '1d', 7], [6, 15000, '1d 12h', 8], [7, 31500, '1d 18h', 9], [8, 47500, '2d', 10], [9, 75000, '3d', 11], [10, 100000, '4d', 12], [11, 115000, '4d 12h', 13], [12, 160000, '5d', 14], [13, 220000, '9d', 15], [14, 335000, '14d', 16]],
  },
  {
    id: 'hog-rider', name: 'Hog Rider', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Hog_Rider',
    rows: [[2, 2000, '10h', 5], [3, 3500, '18h', 6], [4, 5000, '1d', 6], [5, 10000, '2d', 7], [6, 18500, '2d 6h', 8], [7, 35000, '2d 12h', 9], [8, 47500, '3d', 10], [9, 50000, '3d 12h', 10], [10, 85000, '4d', 11], [11, 107500, '5d', 12], [12, 125000, '5d 12h', 13], [13, 175000, '6d 12h', 14], [14, 240000, '10d', 15], [15, 340000, '14d 12h', 16]],
  },
  {
    id: 'valkyrie', name: 'Valkyrie', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Valkyrie',
    rows: [[2, 3000, '8h', 6], [3, 5000, '1d', 7], [4, 10000, '1d 12h', 7], [5, 16000, '1d 18h', 8], [6, 31500, '2d', 9], [7, 55000, '2d 6h', 10], [8, 77500, '3d', 11], [9, 105000, '4d 12h', 12], [10, 120000, '5d', 13], [11, 170000, '6d', 14], [12, 340000, '14d', 15]],
  },
  {
    id: 'golem', name: 'Golem', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Golem',
    rows: [[2, 4000, '16h', 6], [3, 6000, '1d 12h', 7], [4, 10000, '2d', 7], [5, 18500, '2d 6h', 8], [6, 26500, '2d 12h', 9], [7, 38500, '2d 18h', 9], [8, 50000, '3d', 10], [9, 62500, '3d 12h', 10], [10, 80000, '4d', 11], [11, 105000, '5d', 12], [12, 122500, '5d 12h', 13], [13, 175000, '6d', 14], [14, 230000, '10d', 15], [15, 350000, '14d 12h', 16]],
  },
  {
    id: 'witch', name: 'Witch', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Witch',
    rows: [[2, 20000, '2d', 7], [3, 29000, '3d', 8], [4, 45000, '3d 12h', 9], [5, 62500, '4d', 10], [6, 150000, '5d 12h', 13], [7, 180000, '7d 6h', 14], [8, 355000, '15d 12h', 16]],
  },
  {
    id: 'lava-hound', name: 'Lava Hound', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Lava_Hound',
    rows: [[2, 14000, '2d', 7], [3, 21500, '2d 12h', 8], [4, 42500, '3d', 9], [5, 60000, '4d', 10], [6, 80000, '7d', 11], [7, 200000, '8d', 14], [8, 345000, '15d 6h', 16]],
  },
  {
    id: 'bowler', name: 'Bowler', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Bowler',
    rows: [[2, 32500, '2d', 8], [3, 44000, '2d 12h', 9], [4, 62500, '3d', 10], [5, 85000, '4d', 11], [6, 110000, '6d', 12], [7, 145000, '7d', 13], [8, 175000, '7d 12h', 14], [9, 260000, '10d', 15], [10, 360000, '15d', 16]],
  },
  {
    id: 'ice-golem', name: 'Ice Golem', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Ice_Golem',
    rows: [[2, 27500, '2d', 9], [3, 42500, '2d 12h', 9], [4, 50000, '3d 6h', 10], [5, 62500, '4d', 10], [6, 110000, '6d 12h', 12], [7, 140000, '7d 12h', 13], [8, 180000, '8d', 14], [9, 280000, '10d 14h', 15]],
  },
  {
    id: 'headhunter', name: 'Headhunter', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Headhunter',
    rows: [[2, 57500, '5d', 10], [3, 90000, '7d', 11], [4, 370000, '15d 12h', 16]],
  },
  {
    id: 'apprentice-warden', name: 'Apprentice Warden', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Apprentice_Warden',
    rows: [[2, 90000, '6d', 11], [3, 135000, '7d 12h', 12], [4, 160000, '8d', 13]],
  },
  {
    id: 'druid', name: 'Druid', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Druid',
    rows: [[2, 125000, '8d', 12], [3, 175000, '9d', 13], [4, 187500, '11d', 14], [5, 300000, '12d', 15], [6, 380000, '15d 12h', 16]],
  },
  {
    id: 'furnace-troop', name: 'Furnace', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Furnace_(Troop)',
    rows: [[2, 200000, '9d', 13], [3, 260000, '11d', 14], [4, 320000, '15d', 15]],
  },
  {
    id: 'ruin-witch', name: 'Ruin Witch', kind: 'troop', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Ruin_Witch',
    rows: [[2, 220000, '11d', 14], [3, 300000, '12d', 15], [4, 380000, '15d 12h', 16]],
  },
  // ---- Elixir spells ----
  {
    id: 'lightning-spell', name: 'Lightning Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Lightning_Spell',
    rows: [[2, 50000, '2h', 1], [3, 100000, '4h', 2], [4, 200000, '6h', 3], [5, 600000, '1d', 6], [6, 1500000, '1d 12h', 7], [7, 2500000, '3d', 8], [8, 4200000, '3d 12h', 9], [9, 6300000, '5d', 10], [10, 10000000, '6d', 13], [11, 13500000, '7d', 14], [12, 18500000, '10d', 15], [13, 27000000, '14d', 16]],
  },
  {
    id: 'healing-spell', name: 'Healing Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Healing_Spell',
    rows: [[2, 75000, '3h', 2], [3, 150000, '6h', 4], [4, 300000, '12h', 5], [5, 900000, '1d', 6], [6, 1800000, '1d 12h', 7], [7, 3000000, '3d', 8], [8, 6000000, '5d', 11], [9, 11000000, '6d 12h', 13], [10, 14000000, '7d', 14], [11, 19000000, '10d 12h', 15], [12, 29000000, '15d', 16]],
  },
  {
    id: 'rage-spell', name: 'Rage Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Rage_Spell',
    rows: [[2, 400000, '6h', 3], [3, 800000, '12h', 4], [4, 1000000, '1d', 5], [5, 2000000, '2d', 6], [6, 5000000, '4d', 10], [7, 26000000, '14d', 16]],
  },
  {
    id: 'jump-spell', name: 'Jump Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Jump_Spell',
    rows: [[2, 1000000, '1d', 5], [3, 2000000, '2d', 8], [4, 5000000, '4d', 11], [5, 8000000, '5d', 13]],
  },
  {
    id: 'freeze-spell', name: 'Freeze Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Freeze_Spell',
    rows: [[2, 1200000, '1d', 7], [3, 1700000, '1d 12h', 8], [4, 3000000, '2d', 8], [5, 4200000, '2d 12h', 8], [6, 6000000, '3d 12h', 9], [7, 7000000, '5d', 10], [8, 28000000, '15d 12h', 16]],
  },
  {
    id: 'clone-spell', name: 'Clone Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Clone_Spell',
    rows: [[2, 1500000, '1d', 8], [3, 2500000, '2d', 8], [4, 3000000, '2d 6h', 9], [5, 4000000, '2d 12h', 9], [6, 5000000, '4d', 11], [7, 8000000, '5d', 12], [8, 9000000, '7d', 13], [9, 26000000, '13d 12h', 16]],
  },
  {
    id: 'invisibility-spell', name: 'Invisibility Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Invisibility_Spell',
    rows: [[2, 5000000, '3d', 9], [3, 6000000, '4d', 10], [4, 7000000, '5d', 11]],
  },
  {
    id: 'recall-spell', name: 'Recall Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Recall_Spell',
    rows: [[2, 7500000, '7d', 11], [3, 8000000, '7d 12h', 12], [4, 9000000, '8d', 13], [5, 13000000, '9d', 14], [6, 19000000, '11d', 15], [7, 29000000, '16d', 16]],
  },
  {
    id: 'revive-spell', name: 'Revive Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Revive_Spell',
    rows: [[2, 18000000, '7d', 13], [3, 19000000, '8d', 14], [4, 20000000, '11d 12h', 15], [5, 29500000, '16d', 16]],
  },
  {
    id: 'totem-spell', name: 'Totem Spell', kind: 'spell', resource: 'elixir',
    source: 'https://clashofclans.fandom.com/wiki/Totem_Spell',
    rows: [[2, 21000000, '12d', 14], [3, 22000000, '14d', 15], [4, 23000000, '16d', 16]],
  },
  // ---- Dark spells ----
  {
    id: 'poison-spell', name: 'Poison Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Poison_Spell',
    rows: [[2, 5000, '6h', 6], [3, 10000, '18h', 7], [4, 21500, '2d', 8], [5, 35000, '3d', 9], [6, 55000, '4d', 10], [7, 77500, '5d', 11], [8, 100000, '6d 12h', 12], [9, 135000, '7d', 13], [10, 175000, '8d', 14], [11, 230000, '9d 16h', 15], [12, 350000, '14d 12h', 16]],
  },
  {
    id: 'earthquake-spell', name: 'Earthquake Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Earthquake_Spell',
    rows: [[2, 6000, '12h', 6], [3, 12000, '1d', 7], [4, 25500, '3d', 8], [5, 42000, '3d 12h', 9], [6, 120000, '8d', 12], [7, 200000, '9d', 14], [8, 330000, '13d 12h', 16]],
  },
  {
    id: 'haste-spell', name: 'Haste Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Haste_Spell',
    rows: [[2, 8000, '1d', 7], [3, 17000, '2d', 8], [4, 30000, '3d', 8], [5, 38500, '4d', 9], [6, 200000, '9d', 15], [7, 320000, '12d 12h', 16]],
  },
  {
    id: 'skeleton-spell', name: 'Skeleton Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Skeleton_Spell',
    rows: [[2, 11000, '12h', 8], [3, 17000, '1d', 8], [4, 25000, '2d', 9], [5, 40000, '2d 12h', 10], [6, 50000, '3d', 10], [7, 75000, '4d', 11], [8, 135000, '6d', 13]],
  },
  {
    id: 'bat-spell', name: 'Bat Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Bat_Spell',
    rows: [[2, 13000, '18h', 8], [3, 25500, '1d 12h', 8], [4, 35000, '2d 6h', 9], [5, 47500, '4d', 10], [6, 140000, '7d', 13], [7, 220000, '8d 12h', 15], [8, 300000, '13d', 16]],
  },
  {
    id: 'overgrowth-spell', name: 'Overgrowth Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Overgrowth_Spell',
    rows: [[2, 62500, '5d', 10], [3, 125000, '8d 12h', 12], [4, 175000, '10d', 14], [5, 360000, '16d', 16]],
  },
  {
    id: 'ice-block-spell', name: 'Ice Block Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Ice_Block_Spell',
    rows: [[2, 140000, '10d', 12], [3, 200000, '11d', 13], [4, 280000, '12d', 14], [5, 320000, '14d', 15], [6, 380000, '16d', 16]],
  },
  {
    id: 'angry-spell', name: 'Angry Spell', kind: 'spell', resource: 'dark',
    source: 'https://clashofclans.fandom.com/wiki/Angry_Spell',
    rows: [[2, 150000, '9d 8h', 14], [3, 250000, '12d', 15], [4, 400000, '15d', 16]],
  },
];

function toLevels(raw: Raw): LevelRow[] {
  return raw.rows.map(([level, cost, time, labLevel]) => ({
    level,
    cost,
    time: parseDurationStrict(time, `${raw.id} level ${level}`),
    th: labLevel + 2,
    labLevel,
  }));
}

export const RESEARCH: ResearchDef[] = RAW.map((raw) => ({
  id: raw.id,
  name: raw.name,
  kind: raw.kind,
  resource: raw.resource,
  levels: toLevels(raw),
  source: raw.source,
}));

export const RESEARCH_COUNT = RESEARCH.length;
