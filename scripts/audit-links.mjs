/**
 * Internal link audit: collects every href="/..." in dist/ HTML and verifies
 * each target exists on disk (directory format: /foo/ -> foo/index.html).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const DIST = resolve(new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

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
const seen = new Set();

function targetExists(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return existsSync(join(DIST, 'index.html'));
  // Asset-style paths (favicon.svg, /_astro/app.js) resolve to files.
  if (/\.[a-z0-9]+$/i.test(clean)) return existsSync(join(DIST, clean));
  const path = clean.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
  return existsSync(join(DIST, path));
}

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  const hrefs = html.match(/href="([^"]+)"/g) || [];
  for (const raw of hrefs) {
    const href = raw.slice(6, -1);
    if (!href.startsWith('/')) continue;
    if (href.startsWith('//')) continue;
    if (!targetExists(href)) errors.push(`${rel}: broken internal link -> ${href}`);
    seen.add(href);
  }
}

console.log(`Checked internal links across ${files.length} HTML files (${seen.size} unique targets).`);
if (errors.length) {
  console.error('Link audit FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('Link audit passed: no broken internal links.');
