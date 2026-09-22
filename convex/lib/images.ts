import type { Infer } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { imageRef } from "./validators";

export type ImageRef = Infer<typeof imageRef>;

/** Marks a wire image as a Convex storage reference rather than a URL. */
const STORAGE_PREFIX = "storage:";

/**
 * The site's form of an image: an absolute URL, or `""` for none.
 *
 * Storage URLs are minted here rather than stored, so a file swapped in the
 * dashboard is picked up without rewriting any row.
 */
export async function imageUrl(
  ctx: QueryCtx,
  ref: ImageRef | undefined,
): Promise<string> {
  if (!ref) return "";
  if (ref.kind === "external") return ref.url;
  return (await ctx.storage.getUrl(ref.storageId)) ?? "";
}

/**
 * The editor's form of an image: the reference itself, so that saving a record
 * whose image was not touched cannot turn a file into the URL it resolved to.
 */
export function imageToken(ref: ImageRef | undefined): string {
  if (!ref) return "";
  return ref.kind === "external"
    ? ref.url
    : `${STORAGE_PREFIX}${ref.storageId}`;
}

/**
 * The inverse of `imageToken`. Anything that is not a storage token, an http(s)
 * URL or a root-relative path is treated as absent, which keeps `javascript:` and
 * `data:` values out of an `src`.
 */
export function parseImage(token: unknown): ImageRef | undefined {
  if (typeof token !== "string") return undefined;

  const value = token.trim();
  if (value === "") return undefined;

  if (value.startsWith(STORAGE_PREFIX)) {
    const storageId = value.slice(STORAGE_PREFIX.length);
    return storageId === ""
      ? undefined
      : { kind: "file", storageId: storageId as Id<"_storage"> };
  }

  // `//evil.com/x` is protocol-relative, not same-origin, so one slash only.
  const sameOrigin = value.startsWith("/") && !value.startsWith("//");

  return sameOrigin || isHttpUrl(value)
    ? { kind: "external", url: value }
    : undefined;
}

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Every storage id an image reference in `refs` points at. */
export function storageIdsIn(refs: (ImageRef | undefined)[]): Id<"_storage">[] {
  return refs.flatMap((ref) =>
    ref && ref.kind === "file" ? [ref.storageId] : [],
  );
}
