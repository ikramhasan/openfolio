"use server";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { WritableSection } from "@convex/lib/writable";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { updateTag } from "next/cache";
import { tagFor } from "../../_components/content";
import type { Portfolio } from "../../_components/types";

/**
 * The editor's writes.
 *
 * Both are server functions, so both are reachable as endpoints by anyone who can
 * reach the deployment: the check that matters is inside Convex, where every
 * mutation begins with `requireAdmin`. Nothing here decides whether the caller may
 * write — it only forwards the request's token and refuses to guess when there
 * isn't one.
 *
 * `save` returns the sections Convex found changed and invalidates exactly those
 * cache tags. `updateTag` rather than `revalidateTag` so the editor's own next read
 * sees the write instead of a stale copy.
 */

export type SaveResult =
  | { ok: true; changed: string[] }
  | { ok: false; error: string };

export async function save(portfolio: Portfolio): Promise<SaveResult> {
  const token = await convexAuthNextjsToken();
  if (!token) return { ok: false, error: "Signed out. Sign in and try again." };

  try {
    const { changed } = await fetchMutation(
      api.admin.save,
      { portfolio },
      { token },
    );

    for (const key of changed) updateTag(tagFor(key));

    return { ok: true, changed };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

/** A single-use URL to POST a file to. Convex takes the bytes, not this server. */
export async function createUploadUrl(): Promise<string | null> {
  const token = await convexAuthNextjsToken();
  if (!token) return null;

  try {
    return await fetchMutation(api.files.generateUploadUrl, {}, { token });
  } catch {
    return null;
  }
}

/** Where a file just uploaded can be read from, for the editor to display it. */
export async function storageUrl(storageId: string): Promise<string | null> {
  const token = await convexAuthNextjsToken();
  if (!token) return null;

  try {
    return await fetchQuery(
      api.files.url,
      { storageId: storageId as Id<"_storage"> },
      { token },
    );
  } catch {
    return null;
  }
}

/**
 * One record's body. Its own write rather than part of `save`: the body is not in
 * the wire payload the draft store holds, and it is large enough that sending it
 * with every save of every section would be wasteful.
 */
export async function saveBody(
  section: WritableSection,
  slug: string,
  value: string,
): Promise<SaveResult> {
  const token = await convexAuthNextjsToken();
  if (!token) return { ok: false, error: "Signed out. Sign in and try again." };

  try {
    await fetchMutation(api.bodies.save, { section, slug, value }, { token });

    // The list, the record's own page and the section route all read this tag.
    updateTag(tagFor(section));

    return { ok: true, changed: [section] };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

/**
 * What GitHub says about a contribution, for the editor to fill a record with. A
 * read rather than a write, but a server function all the same: the client cannot
 * hold `GITHUB_TOKEN`, and the deployment's rate limit is not a visitor's to spend.
 */
export type LookupResult =
  | { ok: true; record: Record<string, string | number> }
  | { ok: false; error: string };

export async function lookupContribution(url: string): Promise<LookupResult> {
  const token = await convexAuthNextjsToken();
  if (!token) return { ok: false, error: "Signed out. Sign in and try again." };

  try {
    const record = await fetchAction(api.github.lookup, { url }, { token });
    return { ok: true, record };
  } catch (error) {
    return { ok: false, error: message(error, "Could not reach GitHub.") };
  }
}

function message(
  error: unknown,
  fallback = "Could not save. Nothing was lost; try again.",
): string {
  if (error instanceof Error) {
    // Convex prefixes application errors; the readable part is what was thrown.
    const match = error.message.match(/Uncaught ConvexError:\s*(.*)/);
    if (match) return match[1].trim();
  }

  return fallback;
}
