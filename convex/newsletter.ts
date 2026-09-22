import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";

/**
 * The newsletter list — the only table a visitor can write to.
 *
 * Two limits guard it: one per address, so retrying a typo is cheap but a loop is
 * not, and one global, so the table cannot be filled from a script with a fresh
 * address each time. Neither the caller's address nor the outcome distinguishes an
 * already-subscribed address from a new one; the mutation answers the same way
 * either way, so the list cannot be probed for membership.
 */
const rateLimiter = new RateLimiter(components.rateLimiter, {
  subscribePerEmail: { kind: "fixed window", rate: 3, period: HOUR },
  subscribeGlobal: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 40,
  },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 254;

export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    if (email.length > MAX_LENGTH || !EMAIL.test(email)) {
      return { ok: false };
    }

    await rateLimiter.limit(ctx, "subscribeGlobal", { throws: true });
    await rateLimiter.limit(ctx, "subscribePerEmail", {
      key: email,
      throws: true,
    });

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (!existing) {
      await ctx.db.insert("subscribers", { email, createdAt: Date.now() });
    }

    return { ok: true };
  },
});
