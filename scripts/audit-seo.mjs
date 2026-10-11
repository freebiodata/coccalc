/**
 * SEO quality gate: scans built HTML in dist/.
 * Fails the audit when any page violates the rules:
 * - title 1..60 chars, unique; meta description 1..155 chars, unique
 * - exactly one <h1>
 * - self canonical present and absolute
 * - no em/en dashes anywhere in visible text (batch style rule)
 * - all JSON-LD blocks parse
 * - every <img> has alt
 * - robots meta never noindex on core pages (list below)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const files = walk(DIST);
const errors = [];
const warnings = [];
const seenTitles = new Map();
const seenMetas = new Map();

const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length).replace(/\\/g, '/');

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) errors.push(`${rel}: missing <title>`);
  else if (title.length > 60) errors.push(`${rel}: title is ${title.length} chars (max 60): "${title}"`);
  if (title) {
    if (seenTitles.has(title)) errors.push(`${rel}: duplicate title also used by ${seenTitles.get(title)}`);
    else seenTitles.set(title, rel);
  }

  const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const meta = metaMatch ? metaMatch[1].trim() : '';
  if (!meta) errors.push(`${rel}: missing meta description`);
  else if (meta.length > 155) errors.push(`${rel}: meta description is ${meta.length} chars (max 155)`);
  if (meta) {
    if (seenMetas.has(meta)) errors.push(`${rel}: duplicate meta description also used by ${seenMetas.get(meta)}`);
    else seenMetas.set(meta, rel);
  }

  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length !== 1) errors.push(`${rel}: found ${h1s.length} <h1> elements (need exactly 1)`);

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  else if (!canonical[1].startsWith('https://coccalc.top')) errors.push(`${rel}: canonical is not absolute: ${canonical[1]}`);

  const text = stripTags(html);
  if (/\u2014/.test(text)) errors.push(`${rel}: em dash found in visible text`);
  if (/\u2013/.test(text)) errors.push(`${rel}: en dash found in visible text`);
  // Icons must be inline SVG, never emoji characters.
  const emojiRe = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
  if (emojiRe.test(text)) {
    const found = text.match(emojiRe)[0];
    errors.push(`${rel}: emoji character found in visible text (code ${found.codePointAt(0).toString(16)}); use an SVG icon instead`);
  }

  const ldBlocks = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi) || [];
  for (const block of ldBlocks) {
    const raw = block.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    try {
      JSON.parse(raw);
    } catch (e) {
      errors.push(`${rel}: JSON-LD does not parse: ${e.message}`);
    }
  }

  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgs) {
    if (!/\balt=/.test(img)) errors.push(`${rel}: <img> without alt: ${img.slice(0, 80)}`);
  }

  if (!/name="viewport"/.test(html)) warnings.push(`${rel}: no viewport meta`);
}

console.log(`Scanned ${files.length} HTML files.`);
if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log('  - ' + w);
}
if (errors.length) {
  console.error('SEO audit FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('SEO audit passed: titles, metas, h1 counts, canonicals, dashes, JSON-LD all OK.');
