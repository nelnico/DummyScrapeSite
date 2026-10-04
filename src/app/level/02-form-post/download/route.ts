import { paperPdfResponse } from "@/lib/documents";
import { getPaperById } from "@/lib/papers";

import { grantMatches } from "../grant";

/**
 * Level 02 download: POST only, and the body has to carry the hidden `grant`
 * that sits in the paper's own form.
 *
 * There is deliberately no per-file URL to GET -- one endpoint takes the paper
 * id in the body instead, so a scraper that only collects hrefs finds nothing
 * to follow. Every rejection says why in plain text, because the level is meant
 * to be worked out rather than guessed at.
 */

const TEXT = { "Content-Type": "text/plain; charset=utf-8" };

/** HTML form encodings. Anything else (notably JSON) is turned away. */
const FORM_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
];

function methodNotAllowed(): Response {
  return new Response(
    "Downloads are POST only. Submit the paper's form instead of following a link.\n",
    { status: 405, headers: { ...TEXT, Allow: "POST" } },
  );
}

export async function GET(): Promise<Response> {
  return methodNotAllowed();
}

export async function HEAD(): Promise<Response> {
  return methodNotAllowed();
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm = FORM_TYPES.some((type) => contentType.includes(type));

  if (!isForm) {
    return new Response(
      `Send the form the way a browser would: ${FORM_TYPES.join(" or ")}. Got "${contentType || "nothing"}".\n`,
      { status: 415, headers: TEXT },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("Could not read that request body as form data.\n", {
      status: 400,
      headers: TEXT,
    });
  }

  const paperId = form.get("paper");
  const grant = form.get("grant");

  if (typeof paperId !== "string" || typeof grant !== "string") {
    return new Response(
      "Expected two fields: `paper` and `grant`. Both are in the form on the page.\n",
      { status: 400, headers: TEXT },
    );
  }

  const paper = getPaperById(paperId);
  if (!paper) {
    return new Response("No such document.\n", { status: 404, headers: TEXT });
  }

  // Grants are per paper, so one row's grant will not fetch another's.
  if (!grantMatches(paper, grant)) {
    return new Response(
      "That grant does not belong to that paper. Read the hidden field from the paper's own form.\n",
      { status: 403, headers: TEXT },
    );
  }

  try {
    return await paperPdfResponse(paper);
  } catch {
    return new Response(
      "Document missing from disk. Run `node scripts/generate-corpus.mjs`.\n",
      { status: 500, headers: TEXT },
    );
  }
}
