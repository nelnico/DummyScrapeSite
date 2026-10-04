# Dummy Scrape Site

A local practice target for learning to scrape websites.

Every level serves **the same content** — a paginated archive of 137 fictional
journal papers, where each row links to a detail page and a downloadable PDF.
The only thing that changes between levels is what the site does to stop you.

Scrape it in whatever language you like; this repo contains only the target.

## Running it

```bash
npm install
npm run corpus   # generate the 137 PDFs (only needed once, or after changing the generator)
npm run dev
```

Then open <http://localhost:3000> for the level index.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the site on port 3000 |
| `npm run corpus` | Regenerate `documents/` and `src/data/papers.json` |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route typegen + `tsc --noEmit` |
| `npm run build` | Production build |

## The levels

Levels live at `/level/<slug>`. Only level 01 exists so far; the rest are
designed but not built.

| # | Slug | Level | What it forces you to learn |
| --- | --- | --- | --- |
| 01 | `01-plain` | Plain HTML | Fetch, parse HTML, follow pagination, walk list → detail → file |
| 02 | `02-form-post` | Form POST download | Read hidden form fields, send a POST |
| 03 | `03-js-rendered` | JavaScript-rendered list | Find the XHR, or drive a headless browser |
| 04 | `04-login` | Login required | Post credentials, persist session cookies |
| 05 | `05-captcha` | CAPTCHA gate | Read a challenge off the page and answer it |
| 06 | `06-mfa` | Login + MFA | Generate TOTP codes, handle multi-step auth |
| 07 | `07-rate-limited` | Rate limited | Throttle, read `Retry-After`, back off |
| 08 | `08-header-checks` | Header inspection | Send a coherent set of request headers |
| 09 | `09-tokens-honeypots` | Rotating tokens + honeypots | Carry per-request state; avoid trap links |
| 10 | `10-infinite-scroll` | Infinite scroll | Cursor pagination, or scripted scrolling |
| 11 | `11-obfuscated` | Obfuscated markup | Anchor on structure, not class names; OCR drawn text |
| 12 | `12-fingerprinting` | Bot fingerprinting | Defeat headless-browser detection |

The ladder is a plan, not a promise — levels get built on request, and the list
is easy to reorder or extend. The source of truth is `src/lib/levels.ts`.

### Level 01 — Plain HTML

Entirely undefended, so it is the baseline you measure the others against.

- `GET /level/01-plain?page=N` — server-rendered `<table>`, 10 rows per page,
  14 pages. Each `<tr>` carries `data-paper-id`.
- Pagination links use `rel="prev"` / `rel="next"`; the `Next` link disappears
  on the last page. An out-of-range or non-numeric `page` clamps to a real page
  rather than erroring, so *walk until the next link is gone* is the correct
  strategy — a `while True: page += 1` loop will spin forever on page 14.
- `GET /level/01-plain/paper/<id>` — detail page with the abstract, DOI,
  keywords and full author list.
- `GET /level/01-plain/download/<id>.pdf` — the PDF, served as an attachment.
  No session, no token, no referer check.

The last page holds 7 rows, not 10, which is deliberate: it catches scrapers
that assume a full page.

## The corpus

`scripts/generate-corpus.mjs` writes 137 PDFs into `documents/` plus a metadata
manifest at `src/data/papers.json`. Generation is seeded, so re-running it
produces identical bytes — file sizes and checksums are stable across machines.

The journal (*Meridian Journal of Applied Sciences*), its papers, authors and
institutions are entirely invented, and the PDF text is filler drawn from a
fixed sentence pool.

The PDFs deliberately sit **outside** `public/`. Every download therefore has to
pass through a level's own route handler, which is what lets later levels gate
them with tokens, sessions or rate limits without moving any files.

## Layout

```
documents/                     generated PDFs (not served statically)
scripts/generate-corpus.mjs    corpus generator
src/
  app/
    page.tsx                   level index
    level/01-plain/            one directory per level
      page.tsx                 paginated list
      paper/[id]/page.tsx      detail page
      download/[file]/route.ts PDF download
  components/archive-shell.tsx shared masthead, level banner, footer
  data/papers.json             generated manifest
  lib/
    papers.ts                  typed corpus access + pagination
    documents.ts               reads PDFs off disk, builds the response
    levels.ts                  the level ladder
```

Built with Next.js (App Router) and Tailwind.
