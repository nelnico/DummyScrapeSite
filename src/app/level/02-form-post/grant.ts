import { createHmac, timingSafeEqual } from "node:crypto";

import type { Paper } from "@/lib/papers";

/**
 * Level 02 download grants.
 *
 * Each paper's form carries a hidden `grant` that the download route checks
 * against the paper named in the same body. The grant is an HMAC rather than a
 * random string so it stays stateless -- no session, no server-side store -- and
 * it is derived per paper so lifting one row's grant will not fetch another's.
 *
 * The secret is published here on purpose: the level is about reading hidden
 * fields and shaping a POST body, not about breaking a MAC. Rotating,
 * short-lived tokens are level 09's job.
 */
const GRANT_SECRET = "mjas-level-02-download-grant";

export function grantFor(paper: Paper): string {
  return createHmac("sha256", GRANT_SECRET)
    .update(paper.id)
    .digest("hex")
    .slice(0, 32);
}

export function grantMatches(paper: Paper, supplied: string): boolean {
  const expected = Buffer.from(grantFor(paper));
  const given = Buffer.from(supplied);
  if (expected.byteLength !== given.byteLength) return false;
  return timingSafeEqual(expected, given);
}
