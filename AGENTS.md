<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dummy Scrape Site

A deliberately scrapeable website used to practise scraping techniques. See
`README.md` for what it is and how to run it.

## What this project is for

This repo contains **only the target site**. Scrapers written against it live
elsewhere and may be in any language — never assume Python, and never add
scraper code here.

Every level serves the same content: a paginated archive of the same 137 papers,
each row linking to a detail page and a PDF. Levels differ *only* in what they
do to resist scraping. A change that makes two levels show different data is a
bug, not a feature.

## Adding a level

1. Flip its entry in `src/lib/levels.ts` from `planned` to `available`, and make
   sure `summary` and `forces` describe what actually got built.
2. Create `src/app/level/<slug>/` with its own `page.tsx`, detail page and
   download route. **Levels are self-contained** — copy and adapt rather than
   abstracting shared behaviour out of `01-plain`, because the whole point is
   that each level's request handling differs. Only genuinely invariant chrome
   belongs in `src/components/archive-shell.tsx`.
3. Read paper data through `src/lib/papers.ts` and serve PDFs through
   `src/lib/documents.ts`. Never read the filesystem with a request-supplied
   path; look the paper up in the manifest first.
4. Document the level in `README.md` under "The levels", including the exact
   URLs and any deliberate traps.

Keep each level honestly solvable. Anything secret a scraper is expected to
supply (credentials, a TOTP seed, an API key) must be discoverable — published
on the page, in the README, or both.

## Conventions

- Next.js App Router, TypeScript, Tailwind. `npm`, not pnpm.
- Use the generated route-prop helpers: `PageProps<'/route'>`,
  `LayoutProps<'/route'>`, `RouteContext<'/route'>`. `params` and `searchParams`
  are promises and must be awaited.
- Format dates and numbers with the helpers in `src/lib/papers.ts`, not `Intl`,
  so server and client output always agree.
- The corpus is generated, never hand-edited. Change
  `scripts/generate-corpus.mjs` and re-run `npm run corpus`; generation is
  seeded and must stay deterministic.
- PDFs stay out of `public/` so every download passes through a route handler.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run typecheck` runs `next typegen` first — without it the route-prop
helpers only know about routes from the last build.
