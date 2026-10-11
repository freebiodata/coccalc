# CoCPlanner (coccalc.top)

Free Clash of Clans upgrade calculators: costs, builder scheduling, time to max
and wall prices for every Town Hall from TH1 to TH18, built from cited wiki
data. Static site, no tracking, all math in the browser.

## Tools

| Tool | URL | What it does |
|---|---|---|
| Upgrade Cost Calculator | `/upgrade-cost-calculator/` | Total gold/elixir/dark elixir for any building, hero, pet, troop or spell upgrade path, plus cost to max from any TH |
| Upgrade Time Planner | `/upgrade-time-planner/` | Builder-aware greedy longest-first schedule, finish date, per-TH milestones, what to start first |
| Time to Max Calculator | `/time-to-max-calculator/` | Remaining time to max with builders, heroes, pets and lab as parallel tracks, month by month calendar |
| Wall Cost Calculator | `/wall-calculator/` | Gold/elixir cost for any number of walls between two levels |
| Cost to Max Tables | `/cost-to-max/` | Data hub: per-TH and cumulative cost tables |
| Upgrade Priority Guide | `/guides/upgrade-priority/` | Evergreen what-to-upgrade-first guidance |

Plus trust pages: About, Data and Methods, Contact, Privacy, Terms, Changelog,
HTML sitemap and a real 404.

## Tech

- [Astro 5](https://astro.build) static site (SSG), zero client framework:
  the calculators are small vanilla TypeScript islands.
- Icon system: one inline SVG stroke-icon registry (`src/lib/icons.ts`) shared
  by server components (`Icon.astro`) and client islands (`ui.ts`). No icon
  fonts, no emojis anywhere (the build audit fails on emoji characters).
- Data modules in `src/data/` compiled from the Clash of Clans Wiki
  (snapshot 2026-10-11). See `docs/data-sources.md` for every source,
  derivation and uncertainty flag.
- Scheduling math: LPT (longest processing time first) greedy schedule per TH
  segment; heroes, pets and the laboratory run as parallel tracks.
- Node 22 (`.nvmrc`).

## Commands

```bash
npm install        # install deps (Node 22+)
npm run dev        # local dev server
npm run build      # build to dist/
npm run preview    # serve dist/ locally
npm test           # unit + DOM tests (Vitest, 44 tests)
npm run audit      # SEO + link audits against dist/ (run after build)
npm run audit:full # build + test + audit in one go
```

## Project layout

```
src/
  data/        # game data (buildings, walls, heroes, pets, research) + types
  lib/         # parse (durations), schedule (LPT), calc (aggregation), format
  scripts/     # calculator islands (vanilla TS, mount on data-* roots)
  components/  # layout, breadcrumbs, FAQ, tool cards, trust block
  pages/       # all pages (tool pages, guide, trust pages, 404, sitemap)
scripts/       # fetch-wiki.mjs, compile-data.mjs, audit-seo.mjs, audit-links.mjs
data-raw/      # cached wiki wikitext + parsed JSON (audit trail)
docs/          # data-sources.md
tests/         # Vitest: math, data integrity, DOM
public/        # robots.txt, _headers (Cloudflare), favicon
```

## Quality gates (all enforced)

- `npm test`: 44 tests covering the duration parser, LPT scheduling (including
  the 4/3-approximation bound), segment/cumulative cost math, wall pricing,
  dataset integrity (coverage, contiguity, TH bounds, counts), hand-verified
  wiki spot checks (X-Bow, Town Hall 10, Cannon 1-3, wall 14, Barbarian King 2)
  and DOM tests that mount every calculator island and drive its controls.
- `npm run audit`: titles 60 chars or fewer and unique, meta descriptions 155
  or fewer and unique, exactly one H1 per page, absolute self-canonicals,
  valid JSON-LD, alt text on images, no em or en dashes in visible text,
  and a full internal link check (no 404s).
- `.nvmrc` pins Node 22; `engines.node >= 22`.

## SEO summary

- Primary keywords mapped one page per intent: "clash of clans upgrade
  calculator" (cost tool), "clash of clans upgrade time" (planner), "how long
  to max" (time to max tool), "coc wall cost" (wall tool), "clash of clans
  cost to max" (data hub).
- JSON-LD: Organization + WebSite on the home page; WebApplication on all four
  tool pages; BreadcrumbList on every subpage; Article on the guide; Dataset on
  the cost tables. No fake ratings anywhere.
- FAQ blocks are real questions with answers computed from the same data the
  calculators use, rendered in the initial HTML as details/summary.
- `sitemap-index.xml` via @astrojs/sitemap, referenced from robots.txt.

## Deploying to Cloudflare Pages

1. Push this folder to a Git repository (GitHub or GitLab).
2. In Cloudflare: Workers & Pages -> Create -> Pages -> Connect to Git, pick
   the repo.
3. Build settings (also fine to leave the framework preset on "Astro"):
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Environment variables (Settings -> Variables):
   - `NODE_VERSION` = `22` (the `.nvmrc` in the repo root is also respected)
5. Deploy. First build takes a minute; every push to `main` deploys production,
   other branches get preview URLs.
6. Custom domain:
   - Pages project -> Custom domains -> Set up a domain -> `coccalc.top`
   (and optionally `www.coccalc.top` redirecting to the apex).
   - If the domain's DNS is on Cloudflare, the records are added for you;
     otherwise add a CNAME to `<project>.pages.dev`.
   - HTTPS certificates are issued automatically; HSTS can be enabled in the
     Cloudflare TLS settings once you are confident.
7. `public/_headers` is already deployed with the site: long-cache immutable
   `/_astro/*` assets, basic security headers (nosniff, X-Frame-Options,
   Referrer-Policy, Permissions-Policy) and no-cache on HTML.
   `public/robots.txt` points to `https://coccalc.top/sitemap-index.xml`,
   so submit that URL in Google Search Console and Bing Webmaster Tools after
   the first deploy.
8. Optional post-deploy checks: verify `https://coccalc.top/robots.txt`,
   `/sitemap-index.xml`, and a tool page render; the audits in this repo
   (`npm run audit:full`) run the same checks locally.

## Updating game data after a Clash of Clans update

See "Updating the data" at the end of `docs/data-sources.md`: refetch the wiki
pages with `scripts/fetch-wiki.mjs`, regenerate the TS modules with
`scripts/compile-data.mjs`, run the tests, bump the snapshot date and log the
change in `src/pages/changelog.astro`.

## Legal

Fan-made tool, not affiliated with Supercell. Clash of Clans is a trademark of
Supercell Oy. See the Terms page and Supercell's fan content policy.
