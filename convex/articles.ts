import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireAdmin } from "./lib/authz";
import { bodyToTokens, bodyToUrls, EMPTY_BODY } from "./lib/body";
import { imageUrl } from "./lib/images";

/**
 * One article, written here rather than linked to.
 *
 * A post is a row in `articles` either way; what makes it native is a row in
 * `articleBodies` under the same slug. The site's list links to `/articles/<slug>`
 * for the posts that have one and out to `url` for the rest, so the older imported
 * posts keep working.
 *
 * `read` is public and has no notion of a draft: a body that exists is published.
 * Everything that writes begins with `requireAdmin`, which takes the identity from
 * the request's token and re-reads the admin flag.
 */

const meta = {
  title: v.string(),
  slug: v.string(),
  excerpt: v.union(v.string(), v.null()),
  publishedAt: v.string(),
  readTimeMinutes: v.number(),
  views: v.number(),
  coverImage: v.string(),
};

async function bySlug(
  ctx: QueryCtx,
  slug: string,
): Promise<Doc<"articles"> | null> {
  return ctx.db
    .query("articles")
    .withIndex("slug", (q) => q.eq("slug", slug))
    .first();
}

async function bodyFor(
  ctx: QueryCtx | MutationCtx,
  slug: string,
): Promise<Doc<"articleBodies"> | null> {
  return ctx.db
    .query("articleBodies")
    .withIndex("slug", (q) => q.eq("slug", slug))
    .first();
}

async function projectMeta(ctx: QueryCtx, row: Doc<"articles">) {
  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt,
    readTimeMinutes: row.readTimeMinutes,
    views: row.views,
    coverImage: await imageUrl(ctx, row.coverImage),
  };
}

/**
 * A post's own page. `null` where there is no post under that slug or it was never
 * written here, which is what the route turns into a 404.
 */
export const read = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), v.object({ ...meta, body: v.string() })),
  handler: async (ctx, { slug }) => {
    const row = await bySlug(ctx, slug);
    if (!row) return null;

    const body = await bodyFor(ctx, slug);
    if (!body) return null;

    return {
      ...(await projectMeta(ctx, row)),
      body: await bodyToUrls(ctx, body.value),
    };
  },
});

/**
 * The slugs with a body, for the list's link targets and the route's prerender.
 * One row per written post — a handful — so collecting the table is bounded.
 */
export const written = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const rows = await ctx.db.query("articleBodies").collect();
    return rows.map((row) => row.slug);
  },
});

/**
 * The editor's read. Images come back resolved rather than as tokens, because the
 * editor has to display them; `save` turns them back into tokens.
 */
export const load = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      ...meta,
      body: v.string(),
      updatedAt: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx, { slug }) => {
    await requireAdmin(ctx);

    const row = await bySlug(ctx, slug);
    if (!row) return null;

    const body = await bodyFor(ctx, slug);

    return {
      ...(await projectMeta(ctx, row)),
      body: body ? await bodyToUrls(ctx, body.value) : EMPTY_BODY,
      updatedAt: body?.updatedAt ?? null,
    };
  },
});

/** The body, and nothing else about the post: its record is edited in `/admin`. */
export const save = mutation({
  args: { slug: v.string(), value: v.string() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, { slug, value }) => {
    await requireAdmin(ctx);

    // Refusing an unknown slug keeps a renamed post from leaving a body behind
    // under a slug nothing addresses.
    const row = await bySlug(ctx, slug);
    if (!row) throw new ConvexError(`No post with the slug "${slug}".`);

    const stored = await bodyToTokens(ctx, value);
    const updatedAt = Date.now();
    const existing = await bodyFor(ctx, slug);

    if (existing)
      await ctx.db.patch(existing._id, { value: stored, updatedAt });
    else
      await ctx.db.insert("articleBodies", { slug, value: stored, updatedAt });

    // An image dropped from the body leaves its file uploaded and unreachable.
    await ctx.scheduler.runAfter(0, internal.files.collectGarbage, {});

    return { updatedAt };
  },
});
