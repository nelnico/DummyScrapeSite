import Link from "next/link";
import type { ReactNode } from "react";

import type { Level } from "@/lib/levels";
import { JOURNAL_ABBREV, JOURNAL_NAME, papers } from "@/lib/papers";

/** Papers are newest first, so the first entry dates the archive. */
const LATEST_YEAR = papers[0].publishedAt.slice(0, 4);

/**
 * Shared chrome for every level: journal masthead, a banner naming the level,
 * and a footer. Levels supply their own markup for the data itself, since that
 * is the part each one is meant to change.
 */
export function ArchiveShell({
  level,
  children,
}: {
  level: Level;
  children: ReactNode;
}) {
  const number = String(level.number).padStart(2, "0");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-neutral-300 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-5">
          {/* The masthead goes to the site home. Linking it at the level's own
              archive would make it a dead click on the page you land on. */}
          <Link href="/" className="archive-type hover:opacity-80">
            <span className="text-lg font-bold tracking-tight">
              {JOURNAL_NAME}
            </span>
            <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
              {JOURNAL_ABBREV}
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <Link
              href={`/level/${level.slug}`}
              className="text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
            >
              Archive
            </Link>
            <Link
              href="/"
              className="text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
            >
              &larr; All levels
            </Link>
          </nav>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-3 text-sm">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Level {number}
          </span>
          <span className="mx-2 text-amber-300 dark:text-amber-800">/</span>
          <span className="font-medium text-amber-900 dark:text-amber-200">
            {level.name}
          </span>
          <span className="mx-2 text-amber-300 dark:text-amber-800">&mdash;</span>
          <span className="text-amber-800 dark:text-amber-300/90">
            {level.forces}
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>

      <footer className="mt-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-neutral-500 dark:text-neutral-400">
          {JOURNAL_NAME} &middot; {LATEST_YEAR} Meridian Academic Press.
          Entirely fictional; published here only as a scraping target.
        </div>
      </footer>
    </div>
  );
}
