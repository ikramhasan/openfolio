import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CACHE_KEYS, tagFor } from "../../_components/content";

/**
 * Publishes content that changed without going through the editor — a row edited in
 * the Convex dashboard, or a snapshot imported — by dropping the cache entries for
 * the sections named in the body.
 *
 * The editor does not use this: it saves through a server function, which knows the
 * session and which sections changed, and calls `updateTag` directly.
 *
 * Guarded by a shared secret rather than a session, because the caller is a script.
 * It can only cause a re-read of content that is public anyway, so the worst a
 * leaked secret buys is wasted work — but it is still a secret: no `NEXT_PUBLIC_`.
 * Without `REVALIDATE_SECRET` set, the route refuses everything.
 */

function authorised(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 16) return false;

  const offered = header?.replace(/^Bearer\s+/i, "") ?? "";

  // Digests rather than the strings themselves: SHA-256 output is always 32 bytes,
  // so the comparison is constant time and cannot throw on a length mismatch.
  return timingSafeEqual(digest(offered), digest(secret));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export async function POST(request: Request): Promise<Response> {
  if (!authorised(request.headers.get("authorization"))) {
    return Response.json({ error: "Not permitted." }, { status: 401 });
  }

  let keys: unknown;
  try {
    keys = ((await request.json()) as { keys?: unknown }).keys;
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 });
  }

  // An unknown key is a caller mistake, and accepting it would let anyone with the
  // secret fill the tag space with entries that match nothing.
  const wanted: string[] = Array.isArray(keys)
    ? CACHE_KEYS.filter((key) => keys.includes(key))
    : [...CACHE_KEYS];

  // "max" matches the `cacheLife` the loaders set, so the refreshed entries get the
  // same lifetime they had.
  for (const key of wanted) revalidateTag(tagFor(key), "max");

  return Response.json({ revalidated: wanted });
}
