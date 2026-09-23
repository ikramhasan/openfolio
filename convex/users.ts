import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { hasAnyUser } from "./lib/authz";

export const signUpOpen = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const configured = (process.env.ADMIN_EMAIL ?? "").trim() !== "";
    return configured && !(await hasAnyUser(ctx));
  },
});

export const viewer = query({
  args: {},
  returns: v.union(
    v.object({ email: v.optional(v.string()), isAdmin: v.boolean() }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return { email: user.email, isAdmin: user.isAdmin === true };
  },
});

const BATCH = 200;

export const releaseAccount = internalMutation({
  args: {},
  returns: v.object({
    released: v.boolean(),
    done: v.boolean(),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) return { released: false, done: true };

    let budget = BATCH;

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .take(budget);

    for (const session of sessions) {
      const tokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .take(budget);

      for (const token of tokens) {
        await ctx.db.delete(token._id);
        budget -= 1;
      }

      if (budget <= 0) return { released: false, done: false };

      await ctx.db.delete(session._id);
      budget -= 1;
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", user._id))
      .take(Math.max(budget, 1));

    for (const account of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .take(Math.max(budget, 1));

      for (const code of codes) {
        await ctx.db.delete(code._id);
        budget -= 1;
      }

      if (budget <= 0) return { released: false, done: false };

      await ctx.db.delete(account._id);
      budget -= 1;
    }

    if (budget <= 0) return { released: false, done: false };

    await ctx.db.delete(user._id);
    return { released: true, done: true };
  },
});
