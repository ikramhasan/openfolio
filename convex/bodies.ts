import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireAdmin } from "./lib/authz";
import { bodyToTokens, bodyToUrls, EMPTY_BODY } from "./lib/body";
import {
  BODY_TABLES,
  slugOf,
  type WritableSection,
  writableSection,
} from "./lib/writable";

/**
 * One record's body, for the sections that can be written here rather than only
 * linked out to — posts, roles, projects, awards.
 *
 * The record itself belongs to its section and is edited with the rest of it; this
 * is only the prose. The site's list links to the record's own page where there is
 * a body and out to its `url` where there is not, so nothing had to be migrated to
 * make a section writable.
 *
 * `read` is public and has no notion of a draft: a body that exists is published.
 * Everything that writes begins with `requireAdmin`, which takes the identity from
 * the request's token and re-reads the admin flag.
 */

async function bodyFor(
  ctx: QueryCtx | MutationCtx,
  section: WritableSection,
  slug: string,
) {
  if (!slug) return null;

  return ctx.db
    .query(BODY_TABLES[section])
    .withIndex("slug", (q) => q.eq("slug", slug))
    .first();
}

/**
 * The record the body belongs to, found by the address it derives rather than by an
 * indexed column: only Articles stores a slug, and the rest have one because of what
 * they are called. A section key is also its record table's name, and a section is
 * tens of rows, so reading it is bounded by design.
 *
 * Two records in a section with the same title would address one page; the site's
 * lists already key their rows by title, so that is an assumption this made before
 * bodies existed.
 */
async function recordFor(
  ctx: QueryCtx,
  section: WritableSection,
  slug: string,
) {
  if (!slug) return null;

  const rows = await ctx.db.query(section).collect();
  return rows.find((row) => slugOf(row) === slug) ?? null;
}

/**
 * A record's body as the site renders it, or `null` where nothing was written under
 * that slug — which is what the route turns into a 404. The record's own fields come
 * from the section's query, so the page's heading and its prose share one cache
 * entry each rather than duplicating the record here.
 */
export const read = query({
  args: { section: writableSection, slug: v.string() },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, { section, slug }) => {
    const body = await bodyFor(ctx, section, slug);
    return body ? await bodyToUrls(ctx, body.value) : null;
  },
});

/**
 * The slugs with a body, for the lists' link targets and the sitemap. One row per
 * written record — a handful — so collecting the table is bounded.
 */
export const written = query({
  args: { section: writableSection },
  returns: v.array(v.string()),
  handler: async (ctx, { section }) => {
    const rows = await ctx.db.query(BODY_TABLES[section]).collect();
    return rows.map((row) => row.slug);
  },
});

/**
 * The editor's read: the record's title, for the header, and the body. Images come
 * back resolved rather than as tokens, because the editor has to display them;
 * `save` turns them back into tokens.
 */
export const load = query({
  args: { section: writableSection, slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      title: v.string(),
      body: v.string(),
      updatedAt: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx, { section, slug }) => {
    await requireAdmin(ctx);

    const record = await recordFor(ctx, section, slug);
    if (!record) return null;

    const body = await bodyFor(ctx, section, slug);

    return {
      title: record.title,
      body: body ? await bodyToUrls(ctx, body.value) : EMPTY_BODY,
      updatedAt: body?.updatedAt ?? null,
    };
  },
});

/** The body, and nothing else about the record: its fields are edited in `/admin`. */
export const save = mutation({
  args: { section: writableSection, slug: v.string(), value: v.string() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, { section, slug, value }) => {
    await requireAdmin(ctx);

    // Refusing an unknown slug keeps a renamed record from leaving a body behind
    // under a slug nothing addresses.
    const record = await recordFor(ctx, section, slug);
    if (!record) {
      throw new ConvexError(`No ${section} record with the slug "${slug}".`);
    }

    const stored = await bodyToTokens(ctx, value);
    const updatedAt = Date.now();
    const existing = await bodyFor(ctx, section, slug);

    if (existing) {
      await ctx.db.patch(existing._id, { value: stored, updatedAt });
    } else {
      await ctx.db.insert(BODY_TABLES[section], {
        slug,
        value: stored,
        updatedAt,
      });
    }

    // An image dropped from the body leaves its file uploaded and unreachable.
    await ctx.scheduler.runAfter(0, internal.files.collectGarbage, {});

    return { updatedAt };
  },
});
