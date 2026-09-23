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

async function recordFor(
  ctx: QueryCtx,
  section: WritableSection,
  slug: string,
) {
  if (!slug) return null;

  const rows = await ctx.db.query(section).collect();
  return rows.find((row) => slugOf(row) === slug) ?? null;
}

export const read = query({
  args: { section: writableSection, slug: v.string() },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, { section, slug }) => {
    const body = await bodyFor(ctx, section, slug);
    return body ? await bodyToUrls(ctx, body.value) : null;
  },
});

export const written = query({
  args: { section: writableSection },
  returns: v.array(v.string()),
  handler: async (ctx, { section }) => {
    const rows = await ctx.db.query(BODY_TABLES[section]).collect();
    return rows.map((row) => row.slug);
  },
});

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

export const save = mutation({
  args: { section: writableSection, slug: v.string(), value: v.string() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, { section, slug, value }) => {
    await requireAdmin(ctx);

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

    await ctx.scheduler.runAfter(0, internal.files.collectGarbage, {});

    return { updatedAt };
  },
});
