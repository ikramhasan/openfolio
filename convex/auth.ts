import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Email and password sign-in for a portfolio with exactly one account.
 *
 * Two gates close the door behind the owner, both inside `createOrUpdateUser`
 * because that is the only path that can create a `users` row:
 *
 * 1. `ADMIN_EMAIL` is the only address that may ever sign up. If it is unset or
 *    malformed, nobody can: an unconfigured deployment is closed rather than open
 *    to whoever finds `/signin` first.
 * 2. Once any user exists, sign-up is refused. Convex mutations are serializable,
 *    so two simultaneous sign-ups cannot both pass this check.
 *
 * There is no password-reset flow: it would need an email provider, and a reset
 * link is a second way into the only privileged account.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return EMAIL.test(email) ? email : "";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = normalizeEmail(params.email);
        if (email === "") throw new ConvexError("Enter a valid email address.");
        return { email };
      },

      // The default is eight characters and nothing else. This is the only
      // account on the deployment, so it is worth more.
      validatePasswordRequirements(password) {
        const failures = [
          password.length < 12 && "at least 12 characters",
          !/[a-z]/.test(password) && "a lower-case letter",
          !/[A-Z]/.test(password) && "an upper-case letter",
          !/\d/.test(password) && "a digit",
        ].filter((failure): failure is string => typeof failure === "string");

        if (failures.length > 0) {
          throw new ConvexError(`The password needs ${failures.join(", ")}.`);
        }
      },
    }),
  ],

  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId !== null) return args.existingUserId;

      const email = normalizeEmail(args.profile.email);
      if (email === "") throw new ConvexError("Enter a valid email address.");

      const allowed = normalizeEmail(process.env.ADMIN_EMAIL);

      // Closed by default. A deployment reachable before `ADMIN_EMAIL` is set
      // would otherwise hand the only privileged account to the first visitor.
      if (allowed === "" || email !== allowed) {
        throw new ConvexError("Sign-ups are closed.");
      }

      if ((await ctx.db.query("users").first()) !== null) {
        throw new ConvexError("Sign-ups are closed.");
      }

      const userId = await ctx.db.insert("users", { email, isAdmin: true });
      return userId as Id<"users">;
    },
  },
});
