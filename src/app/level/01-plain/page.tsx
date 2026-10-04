import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveShell } from "@/components/archive-shell";
import { requireLevel } from "@/lib/levels";
import {
  formatAuthors,
  formatFileSize,
  formatPublishedDate,
  JOURNAL_ABBREV,
  paginatePapers,
  parsePageParam,
  type PaperPage,
} from "@/lib/papers";

const LEVEL = requireLevel("01-plain");
const BASE = `/level/${LEVEL.slug}`;

export const metadata: Metadata = {
  title: "Archive | Meridian Journal of Applied Sciences",
};

/** Page numbers to render: always the ends, plus a window around the current. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  const keep = new Set<number>([1, total, current]);
  for (const offset of [-2, -1, 1, 2]) {
    const page = current + offset;
    if (page > 1 && page < total) keep.add(page);
  }

  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

function Pagination({ result }: { result: PaperPage }) {
  const { page, totalPages, hasPrevious, hasNext } = result;
  const linkClass =
    "rounded border border-neutral-300 px-2.5 py-1 text-sm hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800";
  const mutedClass =
    "rounded border border-neutral-200 px-2.5 py-1 text-sm text-neutral-400 dark:border-neutral-800 dark:text-neutral-600";

  return (
    <nav
      className="mt-6 flex flex-wrap items-center gap-2"
      aria-label="Archive pagination"
    >
      {hasPrevious ? (
        <Link href={`${BASE}?page=${page - 1}`} rel="prev" className={linkClass}>
          &laquo; Previous
        </Link>
      ) : (
        <span className={mutedClass}>&laquo; Previous</span>
      )}

      {pageWindow(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-sm text-neutral-400 dark:text-neutral-600"
          >
            &hellip;
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className="rounded border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-sm text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {entry}
          </span>
        ) : (
          <Link key={entry} href={`${BASE}?page=${entry}`} className={linkClass}>
            {entry}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link href={`${BASE}?page=${page + 1}`} rel="next" className={linkClass}>
          Next &raquo;
        </Link>
      ) : (
        <span className={mutedClass}>Next &raquo;</span>
      )}

      <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
        Page {page} of {totalPages}
      </span>
    </nav>
  );
}

export default async function Level01Page({
  searchParams,
}: PageProps<"/level/01-plain">) {
  const page = parsePageParam((await searchParams).page);
  const result = paginatePapers(page);

  const th =
    "px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-300";
  const td = "px-3 py-3 align-top text-neutral-700 dark:text-neutral-300";

  return (
    <ArchiveShell level={LEVEL}>
      <h1 className="archive-type text-2xl font-bold tracking-tight">
        Archive
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        Showing <strong>{result.firstIndex}</strong>&ndash;
        <strong>{result.lastIndex}</strong> of{" "}
        <strong>{result.totalItems}</strong> papers, newest first.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table
          id="archive-results"
          className="w-full min-w-[56rem] border-collapse text-sm"
        >
          <caption className="sr-only">
            Papers published in {JOURNAL_ABBREV}, page {result.page} of{" "}
            {result.totalPages}
          </caption>
          <thead className="border-b-2 border-neutral-300 dark:border-neutral-700">
            <tr>
              <th scope="col" className={th}>
                Title
              </th>
              <th scope="col" className={th}>
                Authors
              </th>
              <th scope="col" className={th}>
                Section
              </th>
              <th scope="col" className={th}>
                Published
              </th>
              <th scope="col" className={th}>
                Issue
              </th>
              <th scope="col" className={th}>
                Pages
              </th>
              <th scope="col" className={th}>
                Size
              </th>
              <th scope="col" className={th}>
                PDF
              </th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((paper) => (
              <tr
                key={paper.id}
                data-paper-id={paper.id}
                className="border-b border-neutral-200 dark:border-neutral-800"
              >
                <td className={`${td} max-w-sm`}>
                  <Link
                    href={`${BASE}/paper/${paper.id}`}
                    className="archive-type font-medium text-blue-800 underline-offset-2 hover:underline dark:text-blue-300"
                  >
                    {paper.title}
                  </Link>
                </td>
                <td className={td}>{formatAuthors(paper.authors)}</td>
                <td className={td}>{paper.section}</td>
                <td className={`${td} whitespace-nowrap`}>
                  <time dateTime={paper.publishedAt.slice(0, 10)}>
                    {formatPublishedDate(paper.publishedAt)}
                  </time>
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {paper.volume}({paper.issue})
                </td>
                <td className={`${td} whitespace-nowrap`}>{paper.pageRange}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {formatFileSize(paper.fileSize)}
                </td>
                <td className={td}>
                  <a
                    href={`${BASE}/download/${paper.fileName}`}
                    className="text-blue-800 underline-offset-2 hover:underline dark:text-blue-300"
                    download
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination result={result} />
    </ArchiveShell>
  );
}
