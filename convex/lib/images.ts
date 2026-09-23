import type { Infer } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { imageRef } from "./validators";

export type ImageRef = Infer<typeof imageRef>;

const STORAGE_PREFIX = "storage:";

export async function imageUrl(
  ctx: QueryCtx,
  ref: ImageRef | undefined,
): Promise<string> {
  if (!ref) return "";
  if (ref.kind === "external") return ref.url;
  return (await ctx.storage.getUrl(ref.storageId)) ?? "";
}

export function imageToken(ref: ImageRef | undefined): string {
  if (!ref) return "";
  return ref.kind === "external"
    ? ref.url
    : `${STORAGE_PREFIX}${ref.storageId}`;
}

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

export function storageIdsIn(refs: (ImageRef | undefined)[]): Id<"_storage">[] {
  return refs.flatMap((ref) =>
    ref && ref.kind === "file" ? [ref.storageId] : [],
  );
}
