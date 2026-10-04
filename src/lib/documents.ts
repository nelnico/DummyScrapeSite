import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Paper } from "@/lib/papers";

/**
 * The PDF corpus lives outside `public/` on purpose: every download has to pass
 * through a level's own route handler, so later levels can gate it however they
 * like (tokens, sessions, rate limits) without moving any files.
 */
const DOCUMENTS_DIR = path.join(process.cwd(), "documents");

/**
 * Reads a paper's PDF off disk.
 *
 * Takes a `Paper` rather than a string so the filename always comes from the
 * manifest -- request input never reaches the filesystem, which rules out path
 * traversal by construction.
 */
export async function readPaperPdf(paper: Paper): Promise<Buffer> {
  return readFile(path.join(DOCUMENTS_DIR, paper.fileName));
}

/** Serves a paper as a PDF download. */
export async function paperPdfResponse(
  paper: Paper,
  options: { inline?: boolean } = {},
): Promise<Response> {
  const bytes = await readPaperPdf(paper);
  const disposition = options.inline ? "inline" : "attachment";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${disposition}; filename="${paper.fileName}"`,
      // The corpus is immutable, but caching would hide rate limits and token
      // checks from scrapers on later levels.
      "Cache-Control": "no-store",
    },
  });
}
