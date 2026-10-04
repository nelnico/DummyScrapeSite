import { paperPdfResponse } from "@/lib/documents";
import { getPaperByFileName } from "@/lib/papers";

/**
 * Level 01 download: an undefended GET. The URL appears verbatim in the list
 * and detail pages, so following the link is all it takes.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/level/01-plain/download/[file]">,
) {
  const { file } = await ctx.params;
  const paper = getPaperByFileName(file);

  if (!paper) {
    return new Response("No such document.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    return await paperPdfResponse(paper);
  } catch {
    return new Response(
      "Document missing from disk. Run `node scripts/generate-corpus.mjs`.\n",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }
}
