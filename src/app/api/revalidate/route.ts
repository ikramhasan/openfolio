import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CACHE_KEYS, tagFor } from "../../_components/content";

function authorised(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 16) return false;

  const offered = header?.replace(/^Bearer\s+/i, "") ?? "";

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

  const wanted: string[] = Array.isArray(keys)
    ? CACHE_KEYS.filter((key) => keys.includes(key))
    : [...CACHE_KEYS];

  for (const key of wanted) revalidateTag(tagFor(key), "max");

  return Response.json({ revalidated: wanted });
}
