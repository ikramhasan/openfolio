import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";

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
