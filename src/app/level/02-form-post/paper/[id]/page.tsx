import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveShell } from "@/components/archive-shell";
import { requireLevel } from "@/lib/levels";
import {
  formatFileSize,
  formatPublishedDate,
  getPaperById,
  papers,
} from "@/lib/papers";

import { grantFor } from "../../grant";

const LEVEL = requireLevel("02-form-post");
const BASE = `/level/${LEVEL.slug}`;

export function generateStaticParams() {
  return papers.map((paper) => ({ id: paper.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/level/02-form-post/paper/[id]">): Promise<Metadata> {
  const paper = getPaperById((await params).id);
  return { title: paper ? `${paper.title} | MJAS` : "Paper not found | MJAS" };
}

export default async function PaperDetailPage({
  params,
}: PageProps<"/level/02-form-post/paper/[id]">) {
  const paper = getPaperById((await params).id);
  if (!paper) notFound();

  const dt = "py-2 pr-6 font-medium text-neutral-500 dark:text-neutral-400";
  const dd = "py-2 text-neutral-800 dark:text-neutral-200";

  return (
    <ArchiveShell level={LEVEL}>
      <p className="text-sm">
        <Link
          href={BASE}
          className="text-blue-800 underline-offset-2 hover:underline dark:text-blue-300"
        >
          &larr; Back to archive
        </Link>
      </p>

      <article className="mt-6" data-paper-id={paper.id}>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {paper.section} &middot; Volume {paper.volume}, Issue {paper.issue}
        </p>

        <h1 className="archive-type mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight">
          {paper.title}
        </h1>

        <p className="archive-type mt-4 max-w-3xl text-lg text-neutral-800 dark:text-neutral-200">
          {paper.authors.join(", ")}
        </p>
        <p className="mt-1 text-sm italic text-neutral-500 dark:text-neutral-400">
          {paper.affiliation}
        </p>

        <section className="mt-8 max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Abstract
          </h2>
          <p className="archive-type mt-2 leading-relaxed text-neutral-800 dark:text-neutral-200">
            {paper.abstract}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Citation details
          </h2>
          <dl className="mt-2 grid max-w-2xl grid-cols-[auto_1fr] text-sm">
            <dt className={dt}>Published</dt>
            <dd className={dd}>
              <time dateTime={paper.publishedAt.slice(0, 10)}>
                {formatPublishedDate(paper.publishedAt)}
              </time>
            </dd>

            <dt className={dt}>Pages</dt>
            <dd className={dd}>
              {paper.pageRange} ({paper.pageCount} pages)
            </dd>

            <dt className={dt}>DOI</dt>
            <dd className={`${dd} font-mono text-xs`}>{paper.doi}</dd>

            <dt className={dt}>Keywords</dt>
            <dd className={dd}>{paper.keywords.join("; ")}</dd>

            <dt className={dt}>File</dt>
            <dd className={`${dd} font-mono text-xs`}>
              {paper.fileName} &middot; {formatFileSize(paper.fileSize)}
            </dd>
          </dl>
        </section>

        {/* Same form as the list row: there is no PDF href anywhere on the page. */}
        <form
          action={`${BASE}/download`}
          method="post"
          className="download-form mt-8"
        >
          <input type="hidden" name="paper" value={paper.id} />
          <input type="hidden" name="grant" value={grantFor(paper)} />
          <button
            type="submit"
            className="inline-block cursor-pointer rounded border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Download PDF ({formatFileSize(paper.fileSize)})
          </button>
        </form>
      </article>
    </ArchiveShell>
  );
}
