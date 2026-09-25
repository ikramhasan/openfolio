import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireAdmin } from "./lib/authz";
import { bodyToTokens, bodyToUrls, EMPTY_BODY } from "./lib/body";

function row(ctx: QueryCtx | MutationCtx) {
  return ctx.db.query("aboutBio").first();
}

export const read = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const existing = await row(ctx);
    return existing ? await bodyToUrls(ctx, existing.value) : EMPTY_BODY;
  },
});

export const load = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await row(ctx);
    return existing ? await bodyToUrls(ctx, existing.value) : EMPTY_BODY;
  },
});

export const save = mutation({
  args: { value: v.string() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, { value }) => {
    await requireAdmin(ctx);

    const stored = await bodyToTokens(ctx, value);
    const updatedAt = Date.now();
    const existing = await row(ctx);

    if (existing) {
      await ctx.db.patch(existing._id, { value: stored, updatedAt });
    } else {
      await ctx.db.insert("aboutBio", { value: stored, updatedAt });
    }

    await ctx.scheduler.runAfter(0, internal.files.collectGarbage, {});

    return { updatedAt };
  },
});
