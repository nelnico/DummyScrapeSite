import Link from "next/link";

import { levels } from "@/lib/levels";
import { papers } from "@/lib/papers";

function Difficulty({ value }: { value: number }) {
  return (
    <span
      className="font-mono text-xs tracking-tight text-neutral-500 dark:text-neutral-400"
      title={`Difficulty ${value} of 5`}
    >
      {"●".repeat(value)}
      <span className="text-neutral-300 dark:text-neutral-700">
        {"●".repeat(5 - value)}
      </span>
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="border-b border-neutral-200 pb-8 dark:border-neutral-800">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Local scraping practice target
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Dummy Scrape Site
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-300">
          Every level below serves the same thing: a paginated archive of{" "}
          {papers.length} journal papers, where each row links to a detail page
          and a downloadable PDF. The only difference between levels is what
          they do to stop you scraping them.
        </p>
      </header>

      <ol className="mt-10 space-y-3">
        {levels.map((level) => {
          const available = level.status === "available";
          const number = String(level.number).padStart(2, "0");

          const inner = (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-neutral-400 dark:text-neutral-500">
                  {number}
                </span>
                <h2 className="text-base font-semibold">{level.name}</h2>
                {available ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ready
                  </span>
                ) : (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    planned
                  </span>
                )}
                <span className="ml-auto">
                  <Difficulty value={level.difficulty} />
                </span>
              </div>
              <p className="mt-2 pl-9 text-sm text-neutral-600 dark:text-neutral-300">
                {level.summary}
              </p>
              <p className="mt-1 pl-9 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                  Forces:
                </span>{" "}
                {level.forces}
              </p>
            </>
          );

          return (
            <li key={level.slug}>
              {available ? (
                <Link
                  href={`/level/${level.slug}`}
                  className="block rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
                >
                  {inner}
                </Link>
              ) : (
                <div className="block rounded-lg border border-dashed border-neutral-200 p-4 opacity-70 dark:border-neutral-800">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        The archive, the journal and every paper in it are invented. The PDFs are
        generated locally by{" "}
        <code className="font-mono text-xs">scripts/generate-corpus.mjs</code>.
      </footer>
    </main>
  );
}
