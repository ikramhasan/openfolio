"use server";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { WritableSection } from "@convex/lib/writable";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { updateTag } from "next/cache";
import { tagFor } from "../../_components/content";
import type { Portfolio } from "../../_components/types";

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

export async function createUploadUrl(): Promise<string | null> {
  const token = await convexAuthNextjsToken();
  if (!token) return null;

  try {
    return await fetchMutation(api.files.generateUploadUrl, {}, { token });
  } catch {
    return null;
  }
}

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

export async function saveBody(
  section: WritableSection,
  slug: string,
  value: string,
): Promise<SaveResult> {
  const token = await convexAuthNextjsToken();
  if (!token) return { ok: false, error: "Signed out. Sign in and try again." };

  try {
    await fetchMutation(api.bodies.save, { section, slug, value }, { token });

    updateTag(tagFor(section));

    return { ok: true, changed: [section] };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

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
    const match = error.message.match(/Uncaught ConvexError:\s*(.*)/);
    if (match) return match[1].trim();
  }

  return fallback;
}
