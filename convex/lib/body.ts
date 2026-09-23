import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const STORAGE_PREFIX = "storage:";

const MEDIA_TYPES = new Set(["img", "video", "audio", "file"]);

export const EMPTY_BODY = JSON.stringify([
  { type: "p", children: [{ text: "" }] },
]);

type Node = Record<string, unknown>;

type Transform = (node: Node) => Promise<Node | null>;

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMedia(node: Node): boolean {
  return typeof node.type === "string" && MEDIA_TYPES.has(node.type);
}

function parse(json: string): unknown[] {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : JSON.parse(EMPTY_BODY);
  } catch {
    return JSON.parse(EMPTY_BODY);
  }
}

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

async function resolve(ctx: QueryCtx, id: string): Promise<string | null> {
  try {
    return await ctx.storage.getUrl(id as Id<"_storage">);
  } catch {
    return null;
  }
}

export async function bodyToUrls(ctx: QueryCtx, json: string): Promise<string> {
  const value = await walk(parse(json), async (node) => {
    const url = node.url;
    if (typeof url !== "string" || !url.startsWith(STORAGE_PREFIX)) return null;

    const id = url.slice(STORAGE_PREFIX.length);

    return { ...node, url: (await resolve(ctx, id)) ?? "", storageId: id };
  });

  return JSON.stringify(value);
}

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
