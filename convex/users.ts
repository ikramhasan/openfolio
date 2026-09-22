import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { hasAnyUser } from "./lib/authz";

/**
 * Whether the one account can still be claimed: no user exists yet, and the
 * deployment names an address allowed to claim it. The sign-in page reads this to
 * decide whether to offer sign-up at all; the real refusal is in `auth.ts`, and
 * this only agrees with it so the form is not offered when it would be rejected.
 */
export const signUpOpen = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const configured = (process.env.ADMIN_EMAIL ?? "").trim() !== "";
    return configured && !(await hasAnyUser(ctx));
  },
});

/** The signed-in admin, or null. Nothing here is shown to a visitor. */
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

/** How many auth rows one pass deletes, so the transaction stays inside its limits. */
const BATCH = 200;

/**
 * Deletes the account and everything that authenticates it, which re-opens sign-up.
 *
 * There is no password-reset flow — a reset link is a second door into the only
 * privileged account — so this is the way back in after a forgotten password:
 *
 *     npx convex run users:releaseAccount '{}'
 *
 * Sessions and refresh tokens accumulate with use, so each pass deletes a bounded
 * number and reports whether more is left; the user row goes last, so an interrupted
 * run leaves the account intact rather than orphaned. Run it again while it answers
 * `done: false`.
 *
 * Internal, so it needs a deploy key. Anyone who has one can already read and
 * rewrite the whole deployment, so this grants nothing new. It touches no content.
 */
export const releaseAccount = internalMutation({
  args: {},
  returns: v.object({
    released: v.boolean(),
    /** False when the batch filled up and there is more to delete. */
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

      // The session's tokens filled the batch; it has to stay until they are gone.
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
