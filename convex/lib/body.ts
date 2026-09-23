import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * An article body, which is a Plate value stored as JSON text.
 *
 * Only one thing in it is not opaque: a media node's `url`. Those follow the same
 * rule as every other image in the portfolio — a file in Convex storage is held as
 * a `storage:<id>` token and resolved to an absolute URL on read, so a save cannot
 * freeze a resolved URL into the database, and `files.ts` can find the files a body
 * still points at before it sweeps.
 *
 * A storage URL cannot be read backwards: `ctx.storage.getUrl` mints a path that
 * does not contain the id. So the uploader writes the id onto the node beside the
 * URL (`storageId`, set in `ui/media-placeholder-node.tsx`) and that is what the
 * token is made from — and only when the node's URL still resolves to that exact
 * file, so replacing an uploaded image with one from a CDN is not undone by the
 * next save.
 *
 * A link's `url` is a destination rather than a file and is left alone.
 */

const STORAGE_PREFIX = "storage:";

/** Node types whose `url` is a file. */
const MEDIA_TYPES = new Set(["img", "video", "audio", "file"]);

/** One empty paragraph — what an unwritten post opens as. */
export const EMPTY_BODY = JSON.stringify([
  { type: "p", children: [{ text: "" }] },
]);

type Node = Record<string, unknown>;

/** A media node's replacement, or `null` to leave it as it is. */
type Transform = (node: Node) => Promise<Node | null>;

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMedia(node: Node): boolean {
  return typeof node.type === "string" && MEDIA_TYPES.has(node.type);
}

/** The value, or an empty document if it is not the JSON this wrote. */
function parse(json: string): unknown[] {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : JSON.parse(EMPTY_BODY);
  } catch {
    return JSON.parse(EMPTY_BODY);
  }
}

/** The tree again, with every media node put through `transform`. */
async function walk(value: unknown, transform: Transform): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((entry) => walk(entry, transform)));
  }

  if (!isNode(value)) return value;

  const next: Node = {};
  for (const [key, entry] of Object.entries(value)) {
    next[key] = await walk(entry, transform);
  }

  return isMedia(next) ? ((await transform(next)) ?? next) : next;
}

// A malformed or deleted id throws rather than rejecting, so both have to be caught.
async function resolve(ctx: QueryCtx, id: string): Promise<string | null> {
  try {
    return await ctx.storage.getUrl(id as Id<"_storage">);
  } catch {
    return null;
  }
}

/** Storage tokens as absolute URLs: the form the editor and the site both render. */
export async function bodyToUrls(ctx: QueryCtx, json: string): Promise<string> {
  const value = await walk(parse(json), async (node) => {
    const url = node.url;
    if (typeof url !== "string" || !url.startsWith(STORAGE_PREFIX)) return null;

    const id = url.slice(STORAGE_PREFIX.length);

    return { ...node, url: (await resolve(ctx, id)) ?? "", storageId: id };
  });

  return JSON.stringify(value);
}

/**
 * The inverse, for the way in. A node whose URL no longer resolves to the file it
 * was uploaded from loses the reference rather than keeping it: whatever the URL
 * names now is what was meant.
 */
export async function bodyToTokens(
  ctx: MutationCtx,
  json: string,
): Promise<string> {
  const value = await walk(parse(json), async (node) => {
    const id = node.storageId;
    if (typeof id !== "string" || id === "") return null;

    const token = `${STORAGE_PREFIX}${id}`;
    if (node.url === token) return null;

    if (node.url === (await resolve(ctx, id))) return { ...node, url: token };

    const { storageId: _dropped, ...rest } = node;
    return rest;
  });

  return JSON.stringify(value);
}

/** Every stored file a body points at, for the sweep in `files.ts`. */
export function bodyStorageIds(json: string): Id<"_storage">[] {
  const found: Id<"_storage">[] = [];

  const collect = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const entry of value) collect(entry);
      return;
    }

    if (!isNode(value)) return;

    if (
      isMedia(value) &&
      typeof value.url === "string" &&
      value.url.startsWith(STORAGE_PREFIX)
    ) {
      found.push(value.url.slice(STORAGE_PREFIX.length) as Id<"_storage">);
    }

    for (const entry of Object.values(value)) collect(entry);
  };

  collect(parse(json));

  return found;
}
