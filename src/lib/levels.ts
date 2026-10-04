/**
 * The level ladder.
 *
 * Every level shows the same thing -- a paginated list of journal papers whose
 * rows link to a detail page and a PDF download -- and differs only in what it
 * does to stop you scraping it. Levels are added one at a time; `planned` ones
 * are listed on the home page but have no route yet.
 */

export type LevelStatus = "available" | "planned";

export type Level = {
  /** URL segment under `/level/`, e.g. `01-plain` -> `/level/01-plain`. */
  slug: string;
  number: number;
  name: string;
  /** What the page itself does. */
  summary: string;
  /** The technique the level forces you to learn. */
  forces: string;
  /** 1 (trivial) to 5 (nasty). */
  difficulty: number;
  status: LevelStatus;
};

export const levels: Level[] = [
  {
    slug: "01-plain",
    number: 1,
    name: "Plain HTML",
    summary:
      "Server-rendered table, ?page= pagination, direct links to detail pages and PDFs. Nothing is defended.",
    forces: "Fetch, parse HTML, follow pagination, walk list to detail to file.",
    difficulty: 1,
    status: "available",
  },
  {
    slug: "02-form-post",
    number: 2,
    name: "Form POST download",
    summary:
      "Downloads are POST-only and need a hidden field lifted from the page. GETting the file URL fails.",
    forces: "Read hidden form fields, send a POST, keep request bodies right.",
    difficulty: 2,
    status: "planned",
  },
  {
    slug: "03-js-rendered",
    number: 3,
    name: "JavaScript-rendered list",
    summary:
      "The HTML ships empty; the table is filled client-side from a JSON endpoint.",
    forces: "Spot the XHR and call the API, or drive a headless browser.",
    difficulty: 2,
    status: "planned",
  },
  {
    slug: "04-login",
    number: 4,
    name: "Login required",
    summary:
      "The archive sits behind a username and password, with a session cookie.",
    forces: "Post credentials, persist cookies across a whole session.",
    difficulty: 2,
    status: "planned",
  },
  {
    slug: "05-captcha",
    number: 5,
    name: "CAPTCHA gate",
    summary: "A challenge stands between you and the first page of results.",
    forces: "Read a challenge off the page and answer it programmatically.",
    difficulty: 3,
    status: "planned",
  },
  {
    slug: "06-mfa",
    number: 6,
    name: "Login + MFA",
    summary:
      "Login, then a six-digit time-based code. The TOTP secret is published, so it is solvable.",
    forces: "Generate TOTP codes, handle a multi-step auth flow.",
    difficulty: 3,
    status: "planned",
  },
  {
    slug: "07-rate-limited",
    number: 7,
    name: "Rate limited",
    summary: "Too many requests too fast and the archive starts returning 429s.",
    forces: "Throttle, read Retry-After, back off and resume.",
    difficulty: 3,
    status: "planned",
  },
  {
    slug: "08-header-checks",
    number: 8,
    name: "Header inspection",
    summary:
      "Requests without a believable User-Agent, Referer and Accept are turned away.",
    forces: "Send a coherent set of request headers, not just one.",
    difficulty: 3,
    status: "planned",
  },
  {
    slug: "09-tokens-honeypots",
    number: 9,
    name: "Rotating tokens + honeypots",
    summary:
      "Every link carries a short-lived nonce, and some links are traps that get you blocked.",
    forces: "Carry per-request state, and tell real links from bait.",
    difficulty: 4,
    status: "planned",
  },
  {
    slug: "10-infinite-scroll",
    number: 10,
    name: "Infinite scroll",
    summary: "No page numbers -- results arrive in cursor-based chunks as you scroll.",
    forces: "Follow cursor pagination, or script real scrolling.",
    difficulty: 4,
    status: "planned",
  },
  {
    slug: "11-obfuscated",
    number: 11,
    name: "Obfuscated markup",
    summary:
      "Class names are randomised per request and some text is drawn rather than written.",
    forces: "Anchor on structure instead of class names; OCR what is drawn.",
    difficulty: 5,
    status: "planned",
  },
  {
    slug: "12-fingerprinting",
    number: 12,
    name: "Bot fingerprinting",
    summary:
      "The page probes the client for signs of automation before it will show results.",
    forces: "Understand and defeat headless-browser detection.",
    difficulty: 5,
    status: "planned",
  },
];

export function getLevel(slug: string): Level | undefined {
  return levels.find((level) => level.slug === slug);
}

/** For a level's own pages, where the slug is hardcoded and must resolve. */
export function requireLevel(slug: string): Level {
  const level = getLevel(slug);
  if (!level) throw new Error(`Unknown level: ${slug}`);
  return level;
}

export const availableLevels = levels.filter(
  (level) => level.status === "available",
);
